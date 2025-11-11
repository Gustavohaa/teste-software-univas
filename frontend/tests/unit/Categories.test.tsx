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

  it("renderiza a contagem de tarefas corretamente", async () => {
    server.use(
      apiGet("/categories", (_req) =>
        json({
          data: [
            {
              id: "1",
              name: "Desenvolvimento",
              description: "Tarefas de desenvolvimento",
              createdAt: new Date().toISOString(),
              tasks: [
                {
                  id: "t1",
                  title: "Task 1",
                  user: { id: "u1", name: "User 1" },
                },
                {
                  id: "t2",
                  title: "Task 2",
                  user: { id: "u2", name: "User 2" },
                },
              ],
            },
          ],
        })
      )
    );

    render(<Categories />);

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("renderiza '-' quando não há descrição", async () => {
    server.use(
      apiGet("/categories", (_req) =>
        json({
          data: [
            {
              id: "1",
              name: "Sem Descrição",
              createdAt: new Date().toISOString(),
              tasks: [],
            },
          ],
        })
      )
    );

    render(<Categories />);

    await waitFor(() => {
      expect(screen.getByText("Sem Descrição")).toBeInTheDocument();
      const cells = screen.getAllByText("-");
      expect(cells.length).toBeGreaterThan(0);
    });
  });
});
