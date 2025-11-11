import { render, screen, waitFor } from "@testing-library/react";
import Users from "../../src/components/Users";
import { server, apiGet, json } from "../setup";

describe("Users integration - carga de lista", () => {
  it("renderiza usuários retornados pela API", async () => {
    server.use(
      apiGet("/users", (_req) =>
        json({
          data: [
            {
              id: "1",
              name: "Ana",
              email: "ana@ex.com",
              createdAt: new Date().toISOString(),
              tasks: [],
            },
          ],
        })
      )
    );

    render(<Users />);

    await waitFor(() => {
      expect(screen.getByText("Ana")).toBeInTheDocument();
      expect(screen.getByText("ana@ex.com")).toBeInTheDocument();
    });
  });
});
