

export default function Security(){

  const changePassword = () =>{
    toast.success("Password updated locally 🔐");
  };

  return(
    <div className="form-grid">

      <input type="password" placeholder="New Password"/>
      <input type="password" placeholder="Confirm Password"/>

      <button className="save-btn" onClick={changePassword}>
        Update Password
      </button>

    </div>
  );
}


/* Toggle */

function Toggle({label}){
  return(
    <div className="toggle-row">
      <span>{label}</span>

      <label className="switch">
        <input type="checkbox"/>
        <span className="slider"/>
      </label>
    </div>
  )
}
