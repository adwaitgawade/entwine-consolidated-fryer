import * as React from "react"
import { cn } from "@/lib/utils"

type DropzoneOptions = {
    maxFiles?: number
    maxSize?: number // in bytes
    multiple?: boolean
    accept?: string[] // list of allowed file extensions
}

type FileUploaderContextValue = {
    files: File[]
    setFiles: (files: File[]) => void
    options: Required<DropzoneOptions>
}

const FileUploaderContext = React.createContext<FileUploaderContextValue | null>(null)

function useFileUploaderContext() {
    const ctx = React.useContext(FileUploaderContext)
    if (!ctx) {
        throw new Error("FileUploader.* components must be used within <FileUploader>")
    }
    return ctx
}

type FileUploaderProps = {
    value: File[] | null
    onValueChange: (files: File[] | null) => void
    dropzoneOptions?: DropzoneOptions
    className?: string
    children?: React.ReactNode
}

function FileUploader({
    value,
    onValueChange,
    dropzoneOptions,
    className,
    children,
}: FileUploaderProps) {
    const [internalFiles, setInternalFiles] = React.useState<File[]>(() => value ?? [])

    React.useEffect(() => {
        setInternalFiles(value ?? [])
    }, [value])

    const options: Required<DropzoneOptions> = {
        maxFiles: dropzoneOptions?.maxFiles ?? 1,
        maxSize: dropzoneOptions?.maxSize ?? 1024 * 1024 * 5,
        multiple: dropzoneOptions?.multiple ?? false,
        accept: dropzoneOptions?.accept ?? [],
    }

    const setFiles = React.useCallback(
        (files: File[]) => {
            setInternalFiles(files)
            onValueChange(files.length ? files : null)
        },
        [onValueChange]
    )

    return (
        <FileUploaderContext.Provider value={{ files: internalFiles, setFiles, options }}>
            <div className={cn("flex flex-col gap-2", className)}>{children}</div>
        </FileUploaderContext.Provider>
    )
}

type FileInputProps = React.ComponentProps<"div"> & {
    id?: string
}

function FileInput({ id, className, children, ...props }: FileInputProps) {
    const { files, setFiles, options } = useFileUploaderContext()
    const inputRef = React.useRef<HTMLInputElement | null>(null)
    const [isDragging, setIsDragging] = React.useState(false)

    const openFileDialog = () => {
        inputRef.current?.click()
    }

    const matchesAccept = (file: File) => {
        if (!options.accept.length) return true
        const lower = file.name.toLowerCase()
        return options.accept.some((ext) => lower.endsWith(ext.toLowerCase()))
    }

    const applyConstraints = (incoming: File[]) => {
        const limited = incoming.filter((file) => file.size <= options.maxSize && matchesAccept(file))
        const combined = options.multiple ? [...files, ...limited] : limited.slice(0, 1)
        const finalList = combined.slice(0, options.maxFiles)
        return finalList
    }

    const handleFiles = (fileList: FileList | null) => {
        if (!fileList) return
        const next = Array.from(fileList)
        const constrained = applyConstraints(next)
        setFiles(constrained)
    }

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
    }

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files)
        // reset so selecting the same file again still triggers change
        if (inputRef.current) inputRef.current.value = ""
    }

    return (
        <div
            id={id}
            role="button"
            tabIndex={0}
            onClick={openFileDialog}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openFileDialog()
            }}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={cn(
                "relative flex cursor-pointer items-center justify-center rounded-md border border-dashed border-input bg-background transition-colors",
                isDragging && "border-ring/60 bg-accent/30",
                className
            )}
            {...props}
        >
            {children}
            <input
                ref={inputRef}
                type="file"
                multiple={options.multiple}
                onChange={onChange}
                accept={options.accept.join(',')}
                className="hidden"
            />
        </div>
    )
}

type FileUploaderContentProps = React.ComponentProps<"div">

function FileUploaderContent({ className, children, ...props }: FileUploaderContentProps) {
    return (
        <div className={cn("flex flex-col gap-2", className)} {...props}>
            {children}
        </div>
    )
}

type FileUploaderItemProps = React.ComponentProps<"div"> & {
    index: number
}

function FileUploaderItem({ index, className, children, ...props }: FileUploaderItemProps) {
    const { files, setFiles } = useFileUploaderContext()

    const remove = () => {
        const next = files.filter((_, i) => i !== index)
        setFiles(next)
    }

    return (
        <div
            className={cn(
                "flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm",
                className
            )}
            {...props}
        >
            {children}
            <button
                type="button"
                onClick={remove}
                className="ml-auto inline-flex h-6 items-center justify-center rounded px-2 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                aria-label="Remove file"
            >
                Remove
            </button>
        </div>
    )
}

export { FileUploader, FileInput, FileUploaderContent, FileUploaderItem }


