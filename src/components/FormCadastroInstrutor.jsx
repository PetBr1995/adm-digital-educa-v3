import { alpha, Box, Button, TextField, Typography } from "@mui/material"
import theme from "../theme/theme"
import { CheckBox, Upload } from "@mui/icons-material"
import api from "../api/axiosInstance"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { ToastContainer, toast} from 'react-toastify'


const FormCadastroInstrutor = () => {

    const [nome, setNome] = useState("");
    const [formacao, setFormacao] = useState("");
    const [sobre, setSobre] = useState("");

    const cadastrarInstrutor = () => {
        api.post("/instrutor/create", {
            nome: nome,
            formacao: formacao,
            sobre: sobre
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }).then(function (response) {
            console.log(response)
        }).catch(function (error) {
            console.log(error)
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        cadastrarInstrutor();
        setNome("");
        setFormacao("");
        setSobre("");
    }

    const navigate = useNavigate();

    const notify = () => toast.success("Cadastro realizado com sucesso!!")

    return (
        <>
            <ToastContainer/>
            <form onSubmit={handleSubmit}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <TextField fullWidth placeholder="Nome..." value={nome} onChange={(e) => setNome(e.target.value)} required />
                    <TextField fullWidth placeholder="Formação..." value={formacao} onChange={(e) => setFormacao(e.target.value)} required />
                    <TextField fullWidth placeholder="Sobre..." multiline rows={4} value={sobre} onChange={(e) => setSobre(e.target.value)} required />
                </Box>
                <Box sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
                        <Button onClick={() => navigate("/instrutores")}  variant="outlined" sx={{ textTransform: "capitalize", color: "#ffffff", border: `1px solid ${theme.palette.divider} ` }}>Cancelar</Button>
                        <Button onClick={notify} type="submit" variant="contained" sx={{ textTransform: "capitalize", color: "#ffffff", fontWeight: 600 }}>Salvar</Button>
                    </Box>
                </Box>
            </form>
        </>
    )
}

export default FormCadastroInstrutor