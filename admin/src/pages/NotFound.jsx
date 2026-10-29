import { Link } from "react-router-dom";
import { PageHead } from "../ui.jsx";
import ui from "../ui.module.css";

export default function NotFound({ message = "This page doesn't exist." }) {
  return (
    <>
      <PageHead title="Not found" intro={message} />
      <p className={ui.message}>
        <Link to="/">Back to hall bookings</Link>
      </p>
    </>
  );
}
