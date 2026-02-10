import { useEffect, useState } from "react";

export default function useConteudoLists(api) {
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [instrutores, setInstrutores] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const listarCategorias = async () => {
      try {
        const res = await api.get("/categorias/list", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const normalized = (res.data || []).map((c) => ({
          id: String(c._id ?? c.id ?? ""),
          nome: String(c.nome ?? c.title ?? ""),
        }));

        setCategorias(normalized);
      } catch (err) {
        console.log(err);
        setCategorias([]);
      }
    };

    const listarSubcategorias = async () => {
      api
        .get("/subcategorias/list", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then(function (response) {
          setSubcategorias(response.data);
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
    };

    const listarInstrutores = async () => {
      try {
        const res = await api.get("/instrutor", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data?.instrutores ?? res.data ?? [];
        const normalized = (Array.isArray(data) ? data : []).map((i) => ({
          id: String(i._id ?? i.id ?? i._idstr ?? ""),
          nome: String(i.nome ?? i.name ?? i.nomeCompleto ?? "Sem nome"),
        }));

        setInstrutores(normalized);
      } catch (err) {
        console.log(err);
        setInstrutores([]);
      }
    };

    const listarTags = async () => {
      try {
        const res = await api.get("/tags", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const normalized = (res.data || [])
          .map((t) => ({
            id: String(t._id ?? t.id ?? ""),
            nome: String(t.nome ?? t.name ?? ""),
          }))
          .filter((t) => {
            const nome = t.nome.trim();
            return nome !== "" && isNaN(Number(nome));
          });

        setTags(normalized);
      } catch (err) {
        console.log(err);
        setTags([]);
      }
    };

    listarCategorias();
    listarSubcategorias();
    listarInstrutores();
    listarTags();
  }, [api]);

  return { categorias, subcategorias, instrutores, tags };
}
