"use client"
import { z } from "zod"
import { toast } from "sonner"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CloudUpload, Paperclip } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileInput, FileUploader, FileUploaderContent, FileUploaderItem } from "@/components/ui/file-upload"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const formSchema = z.object({
    version: z.string().min(1).min(5).max(8),
    inoFile: z.string(),
    organization: z.string()
});

const FileUploadForm = ({ folders }: { folders: (string | undefined)[] }) => {
    console.log(folders);

    const [files, setFiles] = useState<File[] | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const dropZoneConfig = {
        maxFiles: 1,
        maxSize: 1024 * 1024 * 4,
        multiple: false,
    };
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            version: "",
            inoFile: "",
            organization: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (!files || files.length === 0) {
                toast.error("Please select a file to upload.");
                return;
            }
            const file = files[0];
            const formData = new FormData();
            formData.append("version", values.version);
            formData.append("organization", values.organization);
            formData.append("file", file, file.name);

            setSubmitting(true);
            const response = await fetch(`/api/upload`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => "");
                throw new Error(errorText || `Upload failed with status ${response.status}`);
            }

            const result = await response.json().catch(() => ({} as { message?: string }));
            toast.success(result?.message ?? "File uploaded successfully.");
            // Reset state
            setFiles(null);
            form.reset();
        } catch (error: unknown) {
            console.error("Form submission error", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to submit the form. Please try again.";
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10">
                <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Version</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="1.0.1"
                                    type="text"
                                    {...field} />
                            </FormControl>
                            <FormDescription>This is your new version of the file that would be updated.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="inoFile"
                    render={() => (
                        <FormItem>
                            <FormLabel>Select File</FormLabel>
                            <FormControl>
                                <FileUploader
                                    value={files}
                                    onValueChange={setFiles}
                                    dropzoneOptions={dropZoneConfig}
                                    className="relative bg-background rounded-lg p-2"
                                >
                                    <FileInput
                                        id="fileInput"
                                        className="outline-dashed outline-1 outline-slate-500"
                                    >
                                        <div className="flex items-center justify-center flex-col p-8 w-full ">
                                            <CloudUpload className='text-gray-500 w-10 h-10' />
                                            <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="font-semibold">Click to upload</span>
                                                &nbsp; or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                SVG, PNG, JPG or GIF
                                            </p>
                                        </div>
                                    </FileInput>
                                    <FileUploaderContent>
                                        {files &&
                                            files.length > 0 &&
                                            files.map((file, i) => (
                                                <FileUploaderItem key={i} index={i}>
                                                    <Paperclip className="h-4 w-4 stroke-current" />
                                                    <span>{file.name}</span>
                                                </FileUploaderItem>
                                            ))}
                                    </FileUploaderContent>
                                </FileUploader>
                            </FormControl>
                            <FormDescription>Select an .ino.bin file to upload.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Organization</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a verified company" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {folders.map((folder, i) => {
                                        return (
                                            <SelectItem key={folder ?? `idx-${i}`} value={folder ?? ""}>
                                                {folder?.split("/")[0].toUpperCase()}
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                            <FormDescription>Select the organization to upload file to</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={submitting}>{submitting ? "Uploading..." : "Submit"}</Button>
            </form>
        </Form>
    )
}

export default FileUploadForm;