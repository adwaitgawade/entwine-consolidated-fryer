'use client'

import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Server, User, Cpu, Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface UserType {
    id: string
    name: string
    email: string
}

interface DeviceType {
    id: number
    name: string
    macid: string
    userId: string
    activeMenuId: number | null
    displayName: string | null
    createdAt: string
    updatedAt: string
}

interface DeviceFormData {
    name: string
    macid: string
    displayName: string
}

export default function DevicesPage() {
    const [selectedDb, setSelectedDb] = useState<string>('')
    const [users, setUsers] = useState<UserType[]>([])
    const [selectedUser, setSelectedUser] = useState<string>('')
    const [devices, setDevices] = useState<DeviceType[]>([])
    const [loadingUsers, setLoadingUsers] = useState(false)
    const [loadingDevices, setLoadingDevices] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    const [deviceForms, setDeviceForms] = useState<DeviceFormData[]>([
        { name: '', macid: '', displayName: '' },
    ])

    const fetchUsers = useCallback(async (db: string) => {
        setLoadingUsers(true)
        try {
            const res = await fetch(`/api/users?db=${db}`)
            const data = await res.json()
            if (data.users) {
                setUsers(data.users)
            } else {
                toast.error('Failed to load users')
                setUsers([])
            }
        } catch (error) {
            toast.error('Failed to load users')
            setUsers([])
        } finally {
            setLoadingUsers(false)
        }
    }, [])

    const fetchDevices = useCallback(async (db: string, userId: string) => {
        setLoadingDevices(true)
        try {
            const res = await fetch(`/api/devices?db=${db}&userId=${userId}`)
            const data = await res.json()
            if (data.devices) {
                setDevices(data.devices)
            } else {
                toast.error('Failed to load devices')
                setDevices([])
            }
        } catch (error) {
            toast.error('Failed to load devices')
            setDevices([])
        } finally {
            setLoadingDevices(false)
        }
    }, [])

    useEffect(() => {
        if (selectedDb) {
            fetchUsers(selectedDb)
            setSelectedUser('')
            setDevices([])
        }
    }, [selectedDb, fetchUsers])

    useEffect(() => {
        if (selectedDb && selectedUser) {
            fetchDevices(selectedDb, selectedUser)
        }
    }, [selectedDb, selectedUser, fetchDevices])

    const addDeviceForm = () => {
        setDeviceForms((prev) => [...prev, { name: '', macid: '', displayName: '' }])
    }

    const removeDeviceForm = (index: number) => {
        setDeviceForms((prev) => prev.filter((_, i) => i !== index))
    }

    const updateDeviceForm = (index: number, field: keyof DeviceFormData, value: string) => {
        setDeviceForms((prev) =>
            prev.map((form, i) => (i === index ? { ...form, [field]: value } : form))
        )
    }

    const handleSaveDevices = async () => {
        if (!selectedDb || !selectedUser) {
            toast.error('Please select a database and user')
            return
        }

        const validDevices = deviceForms.filter(
            (d) => d.name.trim() && d.macid.trim()
        )

        if (validDevices.length === 0) {
            toast.error('Please fill in at least one device with name and MAC ID')
            return
        }

        setSaving(true)
        try {
            const res = await fetch('/api/devices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    db: selectedDb,
                    devices: validDevices.map((d) => ({
                        ...d,
                        userId: selectedUser,
                    })),
                }),
            })

            const data = await res.json()
            if (res.ok && data.devices) {
                toast.success(`${data.devices.length} device(s) added successfully`)
                setDialogOpen(false)
                setDeviceForms([{ name: '', macid: '', displayName: '' }])
                fetchDevices(selectedDb, selectedUser)
            } else {
                toast.error(data.error || 'Failed to add devices')
            }
        } catch (error) {
            toast.error('Failed to add devices')
        } finally {
            setSaving(false)
        }
    }

    const selectedUserData = users.find((u) => u.id === selectedUser)

    return (
        <div className="min-h-screen bg-background p-6 md:p-10">
            <div className="mx-auto max-w-4xl space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Devices</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage devices for users across environments.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Server className="size-4" />
                            Database Environment
                        </Label>
                        <Select value={selectedDb} onValueChange={setSelectedDb}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select database" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dev">Development</SelectItem>
                                <SelectItem value="prod">Production</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <User className="size-4" />
                            User
                        </Label>
                        <Select
                            value={selectedUser}
                            onValueChange={setSelectedUser}
                            disabled={!selectedDb || loadingUsers || users.length === 0}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue
                                    placeholder={
                                        loadingUsers
                                            ? 'Loading users...'
                                            : !selectedDb
                                                ? 'Select database first'
                                                : users.length === 0
                                                    ? 'No users found'
                                                    : 'Select user'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((u) => (
                                    <SelectItem key={u.id} value={u.id}>
                                        {u.name} ({u.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {selectedUserData && (
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">{selectedUserData.name}</h2>
                                <p className="text-sm text-muted-foreground">{selectedUserData.email}</p>
                            </div>
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="size-4 mr-2" />
                                        Add Devices
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Add Devices</DialogTitle>
                                        <DialogDescription>
                                            Add one or more devices for {selectedUserData.name}.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-4">
                                        {deviceForms.map((form, index) => (
                                            <div
                                                key={index}
                                                className="space-y-3 rounded-lg border p-4 relative"
                                            >
                                                {deviceForms.length > 1 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute top-2 right-2 size-8 text-muted-foreground hover:text-destructive"
                                                        onClick={() => removeDeviceForm(index)}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                )}
                                                <div className="space-y-2">
                                                    <Label htmlFor={`device-name-${index}`}>Device Name *</Label>
                                                    <Input
                                                        id={`device-name-${index}`}
                                                        placeholder="e.g. Fryer-001"
                                                        value={form.name}
                                                        onChange={(e) =>
                                                            updateDeviceForm(index, 'name', e.target.value)
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`device-macid-${index}`}>MAC ID *</Label>
                                                    <Input
                                                        id={`device-macid-${index}`}
                                                        placeholder="e.g. AA:BB:CC:DD:EE:FF"
                                                        value={form.macid}
                                                        onChange={(e) =>
                                                            updateDeviceForm(index, 'macid', e.target.value)
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`device-display-${index}`}>
                                                        Display Name (optional)
                                                    </Label>
                                                    <Input
                                                        id={`device-display-${index}`}
                                                        placeholder="e.g. Main Kitchen Fryer"
                                                        value={form.displayName}
                                                        onChange={(e) =>
                                                            updateDeviceForm(index, 'displayName', e.target.value)
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            onClick={addDeviceForm}
                                        >
                                            <Plus className="size-4 mr-2" />
                                            Add Another Device
                                        </Button>
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => setDialogOpen(false)}
                                            disabled={saving}
                                        >
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSaveDevices} disabled={saving}>
                                            {saving && <Loader2 className="size-4 mr-2 animate-spin" />}
                                            Save Devices
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                )}

                {selectedUser && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Cpu className="size-5" />
                            Devices ({devices.length})
                        </h3>

                        {loadingDevices ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="size-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : devices.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-8 text-center">
                                <Cpu className="size-8 mx-auto text-muted-foreground mb-3" />
                                <p className="text-muted-foreground">No devices found for this user.</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Click &quot;Add Devices&quot; to get started.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {devices.map((device) => (
                                    <div
                                        key={device.id}
                                        className="rounded-lg border bg-card p-4 space-y-2"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-semibold">{device.name}</h4>
                                                {device.displayName && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {device.displayName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p>
                                                <span className="font-medium text-foreground">MAC ID:</span>{' '}
                                                {device.macid}
                                            </p>
                                            {device.activeMenuId && (
                                                <p>
                                                    <span className="font-medium text-foreground">
                                                        Active Menu:
                                                    </span>{' '}
                                                    {device.activeMenuId}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
