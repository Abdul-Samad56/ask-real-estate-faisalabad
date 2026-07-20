import { Link, NavLink, Outlet } from 'react-router-dom';
import { SITE } from '../constants';
import { useAuth } from '../auth';
import { whatsappLink } from '../constants';

export default function Layout() {
  const { user, logout, isAuth } = useAuth();

  return (
    <>
      <div className="ad-banner">
        {SITE.city} میں پراپرٹی کرایہ پر لینے یا دینے کے لیے رابطہ کریں —
        <strong> {SITE.contactName}</strong>
        <a href={whatsappLink(SITE.phone)} target="_blank" rel="noreferrer">
          {SITE.phoneDisplay}
        </a>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand">
            <span className="brand-name">{SITE.name}</span>
            <span className="brand-sub">فیصل آباد · خرید و فروخت · کرایہ</span>
          </Link>
          <nav className="nav">
            <NavLink to="/" end>
              ہوم
            </NavLink>
            <NavLink to="/search?purpose=sale">فروخت</NavLink>
            <NavLink to="/search?purpose=rent">کرایہ</NavLink>
            <NavLink to="/list-property">پراپرٹی لگائیں</NavLink>
            <NavLink to="/wishlist">پسندیدہ</NavLink>
            {isAuth ? (
              <>
                <NavLink to="/account">{user?.name || 'اکاؤنٹ'}</NavLink>
                <button type="button" className="btn btn-ghost" onClick={logout}>
                  لاگ آؤٹ
                </button>
              </>
            ) : (
              <NavLink to="/login" className="btn">
                لاگ اِن
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <strong>{SITE.name}</strong>
            <p className="muted" style={{ color: '#cfe4d8' }}>
              فیصل آباد میں رہائشی اور کمرشل پراپرٹی کے لیے قابلِ اعتماد پلیٹ فارم۔
            </p>
          </div>
          <div>
            <strong>روابط</strong>
            <p>
              <Link to="/search">تلاش</Link>
              <br />
              <Link to="/list-property">لسٹنگ</Link>
              <br />
              <Link to="/login">لاگ اِن</Link>
            </p>
          </div>
          <div>
            <strong>رابطہ</strong>
            <p>
              {SITE.contactName}
              <br />
              <a href={`tel:${SITE.phone}`}>{SITE.phoneDisplay}</a>
              <br />
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </p>
          </div>
        </div>
        <div className="container footer-bottom">© {new Date().getFullYear()} {SITE.shortName}</div>
      </footer>
    </>
  );
}
