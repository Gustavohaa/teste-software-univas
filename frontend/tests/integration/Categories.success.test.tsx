import { render, screen, waitFor } from "@testing-library/react";
import Categories from "../../src/components/Categories";
import { server, apiGet, json } from "../setup";

describe("Categories integration - carga de lista", () => {
  it("renderiza categorias retornadas pela API", async () => {
    server.use(
      apiGet("/categories", (_req) =>
        json({
          data: [
            {
              id: "1",
              name: "Desenvolvimento",
              description: "Tarefas de desenvolvimento",
              createdAt: new Date().toISOString(),
              tasks: [],
            },
            {
              id: "2",
              name: "Design",
              description: "Tarefas de design",
              createdAt: new Date().toISOString(),
              tasks: [
                {
                  id: "t1",
                  title: "Criar mockup",
                  user: { id: "u1", name: "João" },
                },
              ],
            },
          ],
        })
      )
    );

    render(<Categories />);

    await waitFor(() => {
      expect(screen.getByText("Desenvolvimento")).toBeInTheDocument();
      expect(
        screen.getByText("Tarefas de desenvolvimento")
      ).toBeInTheDocument();
      expect(screen.getByText("Design")).toBeInTheDocument();
      expect(screen.getByText("Tarefas de design")).toBeInTheDocument();
    });
  });
});
 