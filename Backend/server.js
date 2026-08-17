import "dotenv/config"
import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts"
import { YSocketIO } from "y-socket.io/dist/server"

const app = express()
const port = Number(process.env.PORT) || 3000
const awsRegion = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || ""

app.use(express.static("public"))


const httpServer = createServer(app)


const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

const ySocketIO = new YSocketIO(io)
ySocketIO.initialize()

async function getAwsIdentity() {
  if (!awsRegion) {
    return {
      ok: false,
      reason: "AWS region is missing. Set AWS_REGION or AWS_DEFAULT_REGION.",
    }
  }

  try {
    const client = new STSClient({ region: awsRegion })
    const identity = await client.send(new GetCallerIdentityCommand({}))

    return {
      ok: true,
      region: awsRegion,
      account: identity.Account,
      arn: identity.Arn,
      userId: identity.UserId,
    }
  } catch (error) {
    return {
      ok: false,
      region: awsRegion,
      reason: error instanceof Error ? error.message : "AWS check failed.",
    }
  }
}

app.get('/health', (req, res) => {
    res.status(200).json({
        message: "ok",
        success: true,
    })
})

app.get("/aws/health", async (req, res) => {
  const awsStatus = await getAwsIdentity()

  if (!awsStatus.ok) {
    return res.status(500).json({
      success: false,
      aws: awsStatus,
    })
  }

  return res.status(200).json({
    success: true,
    aws: awsStatus,
  })
})

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
