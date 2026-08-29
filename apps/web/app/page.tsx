import { redirect } from "next/navigation";

// TODO: once auth is wired, check session and redirect to /dashboard if
// logged in, /signin if not.
export default function HomePage(): never {
  redirect("/signin");
}
