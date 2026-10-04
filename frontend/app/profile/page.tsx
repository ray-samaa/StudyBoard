// import styling files
import "./profile.scss";

// import hooks


// import components
import Header from "@/components/header";
import CUserProfile from "@/components/c-user-profile";

// import functions

export default async function Profile() {

  return (
    <div className="profile">
      <Header pageName="profile" />
      <CUserProfile />
    </div>
  );
}
