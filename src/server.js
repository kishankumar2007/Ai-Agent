import express from "express";
import { generateResponse } from "./app.js"
import cors from "cors"
const app = express()
const port = 3000
app.use(express.json())

app.use(cors({
    origin: 'https://dev-helper-agent.vercel.app',
    credentials: true
}))



app.post("/v1/chat", async (req, res) => {
    const { message } = req.body
    const result = await generateResponse(message)
    res.status(200).json({ role: "Perfect AI", message: result })
})

app.listen(port, () => {
    console.log(`server is listing on port: ${port}`);

})
