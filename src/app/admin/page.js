'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatUGX, unitText, orderReference, PRICE_CHECK_MARKETS, DAILY_TARGET_KG, DAILY_COST_MIN, DAILY_COST_MAX } from '@/lib/products';

const STORAGE_KEY = 'eco-coal-admin-key';
const STATUSES = ['pending', 'confirmed', 'delivered', 'cancelled'];
const REFRESH_MS = 30000;

const EMPTY_CHECK = {
  market: 'Owino',
  sellerName: '',
  charcoalQuality: '',
  bagWeightKg: '',
  priceUgx: '',
  checkDate: '',
  notes: '',
  recordedBy: '',
};

function readStoredKey() {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function storeKey(value) {
  try {
    if (value) window.sessionStorage.setItem(STORAGE_KEY, value);
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable; the key simply lives in memory */
  }
}

function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatPhone(phone) {
  const p = String(phone || '');
  return p.length === 12 ? `+${p.slice(0, 3)} ${p.slice(3, 6)} ${p.slice(6)}` : p;
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [ready, setReady] = useState(false);

  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [checks, setChecks] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [filter, setFilter] = useState('all');

  const [checkForm, setCheckForm] = useState(EMPTY_CHECK);
  const [checkErrors, setCheckErrors] = useState({});
  const [checkStatus, setCheckStatus] = useState('');

  const load = useCallback(async (key) => {
    if (!key) return false;
    setLoading(true);
    setLoadError('');
    try {
      const headers = { 'x-admin-key': key };
      const [ordersRes, checksRes] = await Promise.all([
        fetch('/api/orders', { headers, cache: 'no-store' }),
        fetch('/api/price-checks', { headers, cache: 'no-store' }),
      ]);

      if (ordersRes.status === 401 || checksRes.status === 401) {
        storeKey('');
        setAdminKey('');
        setAuthError('That passcode is not correct.');
        return false;
      }

      const ordersData = await ordersRes.json().catch(() => ({}));
      const checksData = await checksRes.json().catch(() => ({}));

      if (!ordersRes.ok) throw new Error(ordersData.error || 'Could not load orders.');
      if (!checksRes.ok) throw new Error(checksData.error || 'Could not load price checks.');

      setOrders(ordersData.orders || []);
      setSummary(ordersData.summary || null);
      setChecks(checksData.checks || []);
      setUpdatedAt(new Date());
      return true;
    } catch (error) {
      setLoadError(error.message || 'Could not reach the server.');
      return true;
    } finally {
      setLoading(false);
    }
  }, []);

  // Restore a passcode saved earlier in this browser tab.
  useEffect(() => {
    const saved = readStoredKey();
    if (saved) {
      setAdminKey(saved);
      load(saved);
    }
    setReady(true);
    setCheckForm((prev) => ({ ...prev, checkDate: todayISO() }));
  }, [load]);

  // Keep the ledger fresh while the page is open.
  useEffect(() => {
    if (!adminKey) return undefined;
    const timer = setInterval(() => load(adminKey), REFRESH_MS);
    return () => clearInterval(timer);
  }, [adminKey, load]);

  async function signIn(event) {
    event.preventDefault();
    const key = keyInput.trim();
    if (!key) {
      setAuthError('Enter the admin passcode.');
      return;
    }
    setAuthError('');
    const ok = await load(key);
    if (ok) {
      storeKey(key);
      setAdminKey(key);
      setKeyInput('');
    }
  }

  function signOut() {
    storeKey('');
    setAdminKey('');
    setOrders([]);
    setSummary(null);
    setChecks([]);
  }

  async function changeStatus(id, status) {
    const previous = orders;
    setOrders((list) => list.map((order) => (order.id === id ? { ...order, status } : order)));
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) throw new Error();
      load(adminKey);
    } catch {
      setOrders(previous);
      setLoadError('The status could not be updated. Please try again.');
    }
  }

  function updateCheck(event) {
    const { name, value } = event.target;
    setCheckForm((prev) => ({ ...prev, [name]: value }));
    if (checkErrors[name]) setCheckErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function saveCheck(event) {
    event.preventDefault();
    setCheckStatus('saving');
    try {
      const response = await fetch('/api/price-checks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({
          ...checkForm,
          bagWeightKg: Number(checkForm.bagWeightKg),
          priceUgx: Number(checkForm.priceUgx),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setCheckErrors(data.fields || {});
        setCheckStatus(data.error || 'Could not save the price check.');
        return;
      }
      setCheckForm({ ...EMPTY_CHECK, market: checkForm.market, recordedBy: checkForm.recordedBy, checkDate: todayISO() });
      setCheckErrors({});
      setCheckStatus('saved');
      load(adminKey);
    } catch {
      setCheckStatus('Could not reach the server.');
    }
  }

  const visibleOrders = useMemo(
    () => (filter === 'all' ? orders : orders.filter((order) => order.status === filter)),
    [orders, filter]
  );

  const today = summary?.today || { orders: 0, kg: 0, revenue: 0 };
  const allTime = summary?.allTime || { orders: 0, kg: 0, revenue: 0 };
  const target = summary?.targetKg || DAILY_TARGET_KG;
  const costMin = summary?.dailyCostMin || DAILY_COST_MIN;
  const costMax = summary?.dailyCostMax || DAILY_COST_MAX;
  const progress = Math.min(100, Math.round((today.kg / target) * 100));
  const balanceLow = today.revenue - costMax;
  const balanceHigh = today.revenue - costMin;

  const marketAverages = useMemo(() => {
    const groups = {};
    checks.forEach((check) => {
      if (!groups[check.market]) groups[check.market] = [];
      groups[check.market].push(Number(check.price_per_kg));
    });
    return Object.entries(groups).map(([market, values]) => ({
      market,
      count: values.length,
      average: values.reduce((sum, v) => sum + v, 0) / values.length,
    }));
  }, [checks]);

  if (!ready) return <section className="admin admin--loading" />;

  /* ---------- Sign-in screen ---------- */
  if (!adminKey) {
    return (
      <section className="admin-login">
        <div className="admin-login__panel">
          <p className="eyebrow">Staff access</p>
          <h1 className="display display--small">Operations ledger</h1>
          <p className="lede lede--small">Enter the staff passcode to view live orders and market price logs.</p>
          <form onSubmit={signIn} className="admin-login__form">
            <div className="field">
              <label htmlFor="adminKey">Passcode</label>
              <input
                id="adminKey"
                type="password"
                autoComplete="current-password"
                value={keyInput}
                onChange={(event) => setKeyInput(event.target.value)}
              />
            </div>
            {authError && <p className="field-error">{authError}</p>}
            <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
              {loading ? 'Checking…' : 'Open the ledger'}
            </button>
          </form>
        </div>
      </section>
    );
  }

  /* ---------- Dashboard ---------- */
  return (
    <section className="admin">
      <div className="wrap">
        <header className="admin__head">
          <div>
            <p className="eyebrow">Staff</p>
            <h1 className="display display--small">Operations ledger</h1>
          </div>
          <div className="admin__actions">
            <span className="admin__updated">
              {loading ? 'Refreshing…' : updatedAt ? `Updated ${updatedAt.toLocaleTimeString('en-GB')}` : ''}
            </span>
            <button type="button" className="btn btn--ghost btn--small" onClick={() => load(adminKey)}>
              Refresh
            </button>
            <button type="button" className="btn btn--ghost btn--small" onClick={signOut}>
              Sign out
            </button>
          </div>
        </header>

        {loadError && (
          <p className="form-alert" role="alert">
            {loadError}
          </p>
        )}

        {/* Today vs target */}
        <div className="target">
          <div className="target__main">
            <p className="target__label">Sold today against the 100 kg daily budget</p>
            <p className="target__value">
              {today.kg.toLocaleString('en-GB')}
              <span> / {target} kg</span>
            </p>
            <div
              className="meter"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={target}
              aria-valuenow={today.kg}
              aria-label="Kilograms sold today"
            >
              <span className="meter__fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="target__note">
              {progress >= 100
                ? 'Daily output target reached.'
                : `${(target - today.kg).toLocaleString('en-GB')} kg left to reach the target.`}
            </p>
          </div>

          <dl className="target__figures">
            <div>
              <dt>Revenue today</dt>
              <dd>{formatUGX(today.revenue)}</dd>
            </div>
            <div>
              <dt>Daily operating budget</dt>
              <dd>
                {formatUGX(costMin)} – {formatUGX(costMax).replace('UGX ', '')}
              </dd>
            </div>
            <div>
              <dt>Balance against budget</dt>
              <dd className={balanceHigh < 0 ? 'is-negative' : balanceLow >= 0 ? 'is-positive' : ''}>
                {formatUGX(balanceLow)} to {formatUGX(balanceHigh)}
              </dd>
            </div>
            <div>
              <dt>Orders today</dt>
              <dd>{today.orders}</dd>
            </div>
          </dl>
        </div>

        <div className="admin__totals">
          <p>
            <span>All orders</span> {allTime.orders}
          </p>
          <p>
            <span>All kg</span> {allTime.kg.toLocaleString('en-GB')}
          </p>
          <p>
            <span>All revenue</span> {formatUGX(allTime.revenue)}
          </p>
          {summary?.byProduct?.map((row) => (
            <p key={row.name}>
              <span>{row.name}</span> {unitText(row.units, row.unitLabel)}
            </p>
          ))}
          {summary?.byLocation?.map((row) => (
            <p key={row.location}>
              <span>{row.location}</span> {row.kg.toLocaleString('en-GB')} kg
            </p>
          ))}
        </div>

        {/* Orders ledger */}
        <div className="ledger-head">
          <h2 className="heading heading--small">Orders</h2>
          <div className="filters" role="group" aria-label="Filter by status">
            {['all', ...STATUSES].map((value) => (
              <button
                key={value}
                type="button"
                className={`filters__btn${filter === value ? ' is-active' : ''}`}
                onClick={() => setFilter(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="ledger-scroll">
          <table className="ledger">
            <thead>
              <tr>
                <th scope="col">Ref</th>
                <th scope="col">Placed</th>
                <th scope="col">Customer</th>
                <th scope="col">Phone</th>
                <th scope="col">Location</th>
                <th scope="col">Items</th>
                <th scope="col" className="num">
                  Kg
                </th>
                <th scope="col" className="num">
                  Total
                </th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="ledger__empty">
                    {orders.length === 0 ? 'No orders yet. Orders placed at checkout appear here.' : 'No orders with this status.'}
                  </td>
                </tr>
              ) : (
                visibleOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="mono">{orderReference(order.id)}</td>
                    <td>{formatDate(order.created_at)}</td>
                    <td>
                      {order.customer_name}
                      {order.delivery_notes && <span className="ledger__sub">{order.delivery_notes}</span>}
                    </td>
                    <td className="mono">
                      <a href={`tel:+${order.phone}`}>{formatPhone(order.phone)}</a>
                    </td>
                    <td>{order.delivery_location}</td>
                    <td>
                      <ul className="ledger__items">
                        {order.items.map((item) => (
                          <li key={item.product_id}>
                            {item.product_name} <span>× {unitText(item.quantity, item.unit_label)}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="num">{Number(order.total_kg)}</td>
                    <td className="num">{formatUGX(order.total_ugx)}</td>
                    <td>
                      <select
                        className={`status-select status-select--${order.status}`}
                        value={order.status}
                        onChange={(event) => changeStatus(order.id, event.target.value)}
                        aria-label={`Status for order ${order.id}`}
                      >
                        {STATUSES.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Price checks */}
        <div className="pricecheck">
          <div className="pricecheck__form-wrap">
            <h2 className="heading heading--small">Log a price check</h2>
            <p className="muted">One row per seller interview in Owino, Kalerwe or Nakawa.</p>

            <form className="pricecheck__form" onSubmit={saveCheck} noValidate>
              <div className="field">
                <label htmlFor="market">Market</label>
                <select id="market" name="market" value={checkForm.market} onChange={updateCheck}>
                  {PRICE_CHECK_MARKETS.map((market) => (
                    <option key={market} value={market}>
                      {market}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="checkDate">Date</label>
                <input id="checkDate" name="checkDate" type="date" value={checkForm.checkDate} onChange={updateCheck} />
                {checkErrors.checkDate && <p className="field-error">{checkErrors.checkDate}</p>}
              </div>
              <div className="field field--wide">
                <label htmlFor="sellerName">Seller or stall</label>
                <input id="sellerName" name="sellerName" type="text" maxLength={120} value={checkForm.sellerName} onChange={updateCheck} />
                {checkErrors.sellerName && <p className="field-error">{checkErrors.sellerName}</p>}
              </div>
              <div className="field field--wide">
                <label htmlFor="charcoalQuality">Charcoal quality</label>
                <input
                  id="charcoalQuality"
                  name="charcoalQuality"
                  type="text"
                  maxLength={80}
                  placeholder="e.g. hardwood, large pieces, some dust"
                  value={checkForm.charcoalQuality}
                  onChange={updateCheck}
                />
                {checkErrors.charcoalQuality && <p className="field-error">{checkErrors.charcoalQuality}</p>}
              </div>
              <div className="field">
                <label htmlFor="bagWeightKg">Bag weight (kg)</label>
                <input
                  id="bagWeightKg"
                  name="bagWeightKg"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={checkForm.bagWeightKg}
                  onChange={updateCheck}
                />
                {checkErrors.bagWeightKg && <p className="field-error">{checkErrors.bagWeightKg}</p>}
              </div>
              <div className="field">
                <label htmlFor="priceUgx">Price (UGX)</label>
                <input id="priceUgx" name="priceUgx" type="number" min="100" step="100" value={checkForm.priceUgx} onChange={updateCheck} />
                {checkErrors.priceUgx && <p className="field-error">{checkErrors.priceUgx}</p>}
              </div>
              <div className="field">
                <label htmlFor="recordedBy">Recorded by</label>
                <input id="recordedBy" name="recordedBy" type="text" maxLength={80} value={checkForm.recordedBy} onChange={updateCheck} />
              </div>
              <div className="field">
                <label htmlFor="notes">Notes</label>
                <input id="notes" name="notes" type="text" maxLength={255} value={checkForm.notes} onChange={updateCheck} />
              </div>
              <div className="pricecheck__submit">
                <button type="submit" className="btn btn--primary" disabled={checkStatus === 'saving'}>
                  {checkStatus === 'saving' ? 'Saving…' : 'Save price check'}
                </button>
                {checkStatus === 'saved' && <span className="muted">Saved.</span>}
                {checkStatus && checkStatus !== 'saving' && checkStatus !== 'saved' && (
                  <span className="field-error">{checkStatus}</span>
                )}
              </div>
            </form>
          </div>

          <div className="pricecheck__log">
            <h2 className="heading heading--small">Field log</h2>
            {marketAverages.length > 0 && (
              <div className="admin__totals admin__totals--compact">
                {marketAverages.map((row) => (
                  <p key={row.market}>
                    <span>
                      {row.market} avg · {row.count} check{row.count > 1 ? 's' : ''}
                    </span>{' '}
                    {formatUGX(row.average)}/kg
                  </p>
                ))}
              </div>
            )}
            <div className="ledger-scroll">
              <table className="ledger">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Market</th>
                    <th scope="col">Seller</th>
                    <th scope="col">Quality</th>
                    <th scope="col" className="num">
                      Bag kg
                    </th>
                    <th scope="col" className="num">
                      Price
                    </th>
                    <th scope="col" className="num">
                      Per kg
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {checks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="ledger__empty">
                        No price checks logged yet.
                      </td>
                    </tr>
                  ) : (
                    checks.map((check) => (
                      <tr key={check.id}>
                        <td>{check.check_date}</td>
                        <td>{check.market}</td>
                        <td>
                          {check.seller_name}
                          {check.recorded_by && <span className="ledger__sub">by {check.recorded_by}</span>}
                        </td>
                        <td>
                          {check.charcoal_quality}
                          {check.notes && <span className="ledger__sub">{check.notes}</span>}
                        </td>
                        <td className="num">{Number(check.bag_weight_kg)}</td>
                        <td className="num">{formatUGX(check.price_ugx)}</td>
                        <td className="num">{formatUGX(check.price_per_kg)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
