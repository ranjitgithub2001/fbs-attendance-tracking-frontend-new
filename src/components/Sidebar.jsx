import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Sidebar({ navSections = [], collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    logout();
    navigate("/login");
  }

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "FB";

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-52"} h-screen bg-fbs-darker text-white flex flex-col justify-between transition-all duration-300 overflow-hidden`}>
      <div>
        <div
          className={`${collapsed ? "px-2" : "px-5"} pt-6 pb-4 relative z-10`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-fbs-card rounded-2xl flex items-center justify-center shadow">
              <img
                src="/src/assets/fbs-logo.png"
                alt="FBS"
                className="w-8 h-8 object-contain"
              />
            </div>

            {!collapsed && (
              <div>
                <div className="text-sm font-semibold">FirstBit</div>
                <div className="text-xs text-gray-400">{user?.role}</div>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full h-10 flex items-center justify-center rounded-lg bg-fbs-card hover:bg-fbs-border transition mb-4">
            <span className="text-lg">☰</span>
          </button>

          {(navSections || []).map((sec) => (
            <div key={sec.label} className="mb-4">
              {!collapsed && (
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                  {sec.label}
                </div>
              )}
              <nav className="space-y-1">
                {(sec.items || []).map((it) => (
                  <NavLink
                    key={it.path}
                    to={it.path}
                    className={({ isActive }) =>
                      `flex items-center ${collapsed ? "justify-center px-0" : "gap-3 px-3"} py-2 rounded-lg text-sm transition-all duration-300 ${
                        isActive
                          ? "bg-[#84cc16] text-black font-semibold scale-[1.02]"
                          : "text-white hover:bg-fbs-card hover:scale-[1.01]"
                      }`
                    }>
                    {it.icon &&
                      (() => {
                        const Icon = it.icon;
                        return <Icon className="w-5 h-5" />;
                      })()}
                    {!collapsed && <span>{it.label}</span>}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>

      <div className={`${collapsed ? "px-2" : "px-5"} pb-6 relative z-10`}>
        <div
          className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} mb-3`}>
          <div className="w-10 h-10 bg-fbs-card rounded-full flex items-center justify-center text-white font-semibold">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1">
              <div className="text-sm">{user?.fullName ?? "FirstBit User"}</div>
              <div className="text-xs text-gray-400">
                {user?.role ?? "GUEST"}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleSignOut}
          className={`w-full text-sm border border-fbs-border rounded-lg px-3 py-2 hover:bg-fbs-card ${
            collapsed ? "text-center px-0" : "text-left"
          }`}>
          {collapsed ? "↩" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
