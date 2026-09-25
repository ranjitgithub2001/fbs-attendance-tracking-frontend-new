import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Sidebar({
  navSections = [],
  collapsed,
  setCollapsed,
  mobileOpen = false,
  onMobileClose,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    onMobileClose?.();
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
      className={`flex h-screen w-52 shrink-0 flex-col justify-between overflow-x-hidden overflow-y-auto bg-fbs-darker text-white
        max-md:fixed max-md:inset-y-0 max-md:z-50 max-md:transition-[left] max-md:duration-300
        ${mobileOpen ? "max-md:left-0" : "max-md:-left-52"}
        md:relative md:left-auto md:z-auto md:transition-all md:duration-300
        ${collapsed ? "md:w-16" : "md:w-52"}`}>
      <div>
        <div
          className={`${collapsed ? "px-5 md:px-2" : "px-5"} pt-6 pb-4 relative z-10`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-fbs-card rounded-2xl flex items-center justify-center shadow shrink-0">
              <img
                src="/src/assets/fbs-logo.png"
                alt="FBS"
                className="w-8 h-8 object-contain"
              />
            </div>

            <div className={collapsed ? "md:hidden" : ""}>
              <div className="text-sm font-semibold">FirstBit</div>
              <div className="text-xs text-gray-400">{user?.role}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-full h-10 items-center justify-center rounded-lg bg-fbs-card hover:bg-fbs-border transition mb-4">
            <span className="text-lg">☰</span>
          </button>

          {(navSections || []).map((sec) => (
            <div key={sec.label} className="mb-4">
              <div
                className={`text-xs text-gray-500 uppercase tracking-widest mb-2 ${
                  collapsed ? "md:hidden" : ""
                }`}>
                {sec.label}
              </div>
              <nav className="space-y-1">
                {(sec.items || []).map((it) => (
                  <NavLink
                    key={it.path}
                    to={it.path}
                    onClick={() => onMobileClose?.()}
                    className={({ isActive }) =>
                      `flex items-center ${
                        collapsed
                          ? "max-md:gap-3 max-md:px-3 md:justify-center md:px-0"
                          : "gap-3 px-3"
                      } py-2 rounded-lg text-sm transition-all duration-300 ${
                        isActive
                          ? "bg-[#84cc16] text-black font-semibold scale-[1.02]"
                          : "text-white hover:bg-fbs-card hover:scale-[1.01]"
                      }`
                    }>
                    {it.icon &&
                      (() => {
                        const Icon = it.icon;
                        return <Icon className="w-5 h-5 shrink-0" />;
                      })()}
                    <span className={collapsed ? "md:hidden" : ""}>
                      {it.label}
                    </span>
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`${collapsed ? "px-5 md:px-2" : "px-5"} pb-6 relative z-10`}>
        <div
          className={`flex items-center mb-3 ${
            collapsed ? "max-md:gap-3 md:justify-center" : "gap-3"
          }`}>
          <div className="w-10 h-10 bg-fbs-card rounded-full flex items-center justify-center text-white font-semibold shrink-0">
            {initials}
          </div>
          <div className={`flex-1 min-w-0 ${collapsed ? "md:hidden" : ""}`}>
            <div className="text-sm truncate">
              {user?.fullName ?? "FirstBit User"}
            </div>
            <div className="text-xs text-gray-400">
              {user?.role ?? "GUEST"}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className={`w-full text-sm border border-fbs-border rounded-lg px-3 py-2 hover:bg-fbs-card ${
            collapsed ? "max-md:text-left md:text-center md:px-0" : "text-left"
          }`}>
          <span className={collapsed ? "md:hidden" : ""}>Sign out</span>
          <span className={collapsed ? "hidden md:inline" : "hidden"}>↩</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
