import { render, screen } from "@testing-library/react";
import App from "./App.jsx";

test("renders the CampusVoice login experience when logged out", () => {
  localStorage.removeItem("username");
  localStorage.removeItem("role");

  render(<App />);

  expect(screen.getByText(/stay anonymous\. be heard/i)).toBeInTheDocument();
});
