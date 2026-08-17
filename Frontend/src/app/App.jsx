import "./App.css"
import { Editor } from "@monaco-editor/react"
import { MonacoBinding } from "y-monaco"
import { useEffect, useRef, useState } from "react"
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io"

function App() {
  const editorRef = useRef(null)
  const [userName, setUserName] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || ""
  })
  const [users, setUsers] = useState([])
  const [isEditorReady, setIsEditorReady] = useState(false)
  const ydocRef = useRef(new Y.Doc())
  const providerRef = useRef(null)
  const bindingRef = useRef(null)

  useEffect(() => {
    return () => {
      bindingRef.current?.destroy?.()
      providerRef.current?.destroy?.()
      ydocRef.current.destroy()
    }
  }, [])

  const handleMount = (editor) => {
    editorRef.current = editor
    setIsEditorReady(true)
  }

  const handleJoin = (e) => {
    e.preventDefault()
    const name = e.currentTarget.username.value.trim()
    if (!name) return

    setUserName(name)
    window.history.pushState({}, "", `?username=${encodeURIComponent(name)}`)
  }

  useEffect(() => {
    if (!userName || !isEditorReady || !editorRef.current?.getModel()) {
      return
    }

    bindingRef.current?.destroy?.()
    providerRef.current?.destroy?.()

    const provider = new SocketIOProvider("http://localhost:3000", "monaco-demo", ydocRef.current, {
      autoConnect: true,
    })

    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().values())
      setUsers(
        states
          .filter((state) => state.user?.username)
          .map((state) => state.user)
      )
    }

    provider.awareness.setLocalStateField("user", { username: userName })
    provider.awareness.on("change", updateUsers)
    updateUsers()

    const binding = new MonacoBinding(
      ydocRef.current.getText("monaco"),
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    )

    const handleBeforeUnload = () => {
      provider.awareness.setLocalStateField("user", null)
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    providerRef.current = provider
    bindingRef.current = binding

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      provider.awareness.off?.("change", updateUsers)
      provider.awareness.setLocalStateField("user", null)
      binding.destroy?.()
      provider.destroy()
      bindingRef.current = null
      providerRef.current = null
      setUsers([])
    }
  }, [isEditorReady, userName])

  if (!userName) {
    return (
      <main className="flex h-screen w-full items-center justify-center gap-4 bg-gray-950 p-4">
        <form
          onSubmit={handleJoin}
          className="flex flex-col gap-4 rounded-lg bg-neutral-900 p-8"
        >
          <input
            type="text"
            placeholder="Enter your name"
            className="rounded-lg bg-gray-800 p-2 text-white"
            name="username"
          />
          <button className="rounded-lg bg-amber-50 p-2 text-black" type="submit">
            Join
          </button>
        </form>
      </main>
    )
  }


  return (
    <main className="flex h-screen w-full gap-4 bg-gray-950 p-4">
      <aside
        className="h-full w-1/4 rounded-lg bg-amber-50"
      >
        <h2 className="p-4 text-lg font-bold">Users</h2>
        <ul className="flex flex-col gap-2 p-4">
          {users.map((user, index) => (
            <li key={index} className="rounded-lg bg-gray-800 p-2 text-white">
              {user.username}
            </li>
          ))}
        </ul>
      </aside>

      <section className="h-full flex-1 overflow-hidden rounded-lg bg-neutral-900">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// some comment"
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            automaticLayout: true,
          }}
          onMount={handleMount}
        />
      </section>
    </main>
  )
}

export default App
