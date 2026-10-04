// import styling files
import "./landing.scss";

// import hooks

// import components
import Image from "next/image";
import Link from "next/link";

export default function Home() {

  return (
    <div className="landing">
      <div>
        <h1>Organize your tasks</h1>
        <Link href="/sign-up" className="main-button">Get Started</Link>
        <p>Already have an account? <Link href="/log-in">Log in</Link></p>
      </div>
    </div>
  );
}
