"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface AuthPopupProps {
    isOpen: boolean
    onClose: () => void
    onAuthenticate: (username: string, password: string) => Promise<boolean>
}

export function AuthPopup({ isOpen, onClose, onAuthenticate }: AuthPopupProps) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!username.trim() || !password.trim()) {
            setError("Please enter both username and password")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const isValid = await onAuthenticate(username, password)
            if (isValid) {
                setUsername("")
                setPassword("")
                onClose()
            } else {
                setError("Invalid username or password")
            }
        } catch (err) {
            console.error(err)
            setError("Authentication failed. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setUsername("")
        setPassword("")
        setError("")
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Authentication Required</DialogTitle>
                    <DialogDescription>
                        Please enter your credentials to upload files.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            disabled={isLoading}
                            required
                        />
                    </div>
                    {error && (
                        <div className="text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}
                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Authenticating..." : "Authenticate"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
