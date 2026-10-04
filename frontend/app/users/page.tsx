// import styling files
import "./users.scss";

// import components
import Image from "next/image";
import Link from "next/link";
import UsersComp from "@/components/users";
import Header from "@/components/header";

export default function UsersPage() {

  return (
    <div className="users">
        <Header pageName="users" />
        <UsersComp />
    </div>
  );
}
