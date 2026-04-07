import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Download, Trash2, Copy, FileText, Image, Video, Music, Search, Share2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { toast } from 'sonner';
import type { FileMetadata } from '../../types/index';

const Dashboard = () => {
    const { token } = useAuthStore();

    const [files, setFiles] = useState<FileMetadata[]>([]);
    const [filteredFiles, setFilteredFiles] = useState<FileMetadata[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(true);

    // Share Modal States
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
    const [selectedFileName, setSelectedFileName] = useState('');
    const [sharePassword, setSharePassword] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const fetchFiles = async () => {
        try {
            const res = await api.get('/files/my-files');
            setFiles(res.data);
            setFilteredFiles(res.data);
        } catch (error) {
            toast.error('Failed to load your files');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    // Search
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredFiles(files);
        } else {
            const filtered = files.filter(file =>
                file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredFiles(filtered);
        }
    }, [searchTerm, files]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) await uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        setIsUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const xhr = new XMLHttpRequest();

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    setUploadProgress(Math.round((event.loaded / event.total) * 100));
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    toast.success(`${file.name} uploaded successfully! ☁️`);
                    fetchFiles();
                } else {
                    toast.error('Upload failed');
                }
                setIsUploading(false);
                setUploadProgress(0);
            };

            xhr.onerror = () => toast.error('Upload failed');
            xhr.open('POST', '/files/upload');
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.send(formData);
        } catch {
            toast.error('Upload failed');
            setIsUploading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadFile(file);
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'png', 'gif', 'jpeg', 'webp'].includes(ext || '')) return <Image className="w-10 h-10 text-pink-500" />;
        if (['mp4', 'mov', 'avi'].includes(ext || '')) return <Video className="w-10 h-10 text-purple-500" />;
        if (['mp3', 'wav'].includes(ext || '')) return <Music className="w-10 h-10 text-amber-500" />;
        return <FileText className="w-10 h-10 text-blue-500" />;
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '—';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const copyPresignedLink = async (fileId: number) => {
        try {
            const res = await api.get(`/files/download/${fileId}`);
            const url = res.data as string;
            await navigator.clipboard.writeText(url);
            toast.success('Pre-signed link copied! Valid for 5 minutes');
        } catch {
            toast.error('Failed to generate link');
        }
    };

    const deleteFile = async (id: number, name: string) => {
        if (!confirm(`Delete ${name}?`)) return;
        try {
            await api.delete(`/files/delete/${id}`);
            toast.success('File deleted successfully');
            fetchFiles();
        } catch {
            toast.error('Failed to delete file');
        }
    };

    // ==================== NEW: SHARE FUNCTIONALITY ====================
    const handleShare = (fileId: number, fileName: string) => {
        setSelectedFileId(fileId);
        setSelectedFileName(fileName);
        setSharePassword('');
        setGeneratedLink('');
        setShowShareModal(true);
    };

    const generateShareLink = async () => {
        if (!selectedFileId) return;

        setIsGenerating(true);
        try {
            const params = sharePassword ? `?password=${encodeURIComponent(sharePassword)}` : '';
            const res = await api.get(`/files/share/${selectedFileId}${params}`);
            const link = res.data as string;

            setGeneratedLink(link);
            await navigator.clipboard.writeText(link);
            toast.success('Share link generated & copied to clipboard!');
        } catch (error: any) {
            toast.error(error.response?.data || 'Failed to generate share link');
        } finally {
            setIsGenerating(false);
        }
    };

    // Skeleton Loader
    const SkeletonCard = () => (
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 animate-pulse">
            <div className="flex justify-center mb-5">
                <div className="w-10 h-10 bg-gray-700 rounded-xl" />
            </div>
            <div className="h-5 bg-gray-700 rounded w-3/4 mx-auto mb-3" />
            <div className="h-3 bg-gray-700 rounded w-1/2 mx-auto" />
            <div className="grid grid-cols-4 gap-3 mt-10">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-9 bg-gray-700 rounded-xl" />
                ))}
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <img src="/skyvault_logo.png" alt="SkyVault" className="h-12 w-auto" />
                    <div>
                        <h1 className="text-4xl font-bold tracking-tighter text-white">My SkyVault</h1>
                        <p className="text-gray-400">Secure Cloud Storage</p>
                    </div>
                </div>

                <label className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-semibold transition-all active:scale-95">
                    <Upload size={22} />
                    Upload New File
                    <input type="file" className="hidden" onChange={handleFileSelect} />
                </label>
            </div>

            {/* Search */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search your files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-2xl focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
                />
            </div>

            {/* Drag & Drop Zone */}
            <motion.div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-16 text-center mb-12 transition-all ${
                    isDragging ? 'border-blue-500 bg-blue-950/50' : 'border-gray-700 hover:border-gray-600'
                }`}
            >
                <Upload className="mx-auto mb-6 text-gray-400" size={56} />
                <p className="text-2xl font-medium text-white">Drop files here</p>
                <p className="text-gray-400 mt-2">or use the upload button above</p>
            </motion.div>

            {/* Upload Progress */}
            <AnimatePresence>
                {isUploading && (
                    <div className="mb-10 bg-gray-900 rounded-3xl p-6 border border-gray-700">
                        <div className="flex justify-between text-sm mb-3">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Files Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : filteredFiles.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-7xl mb-6 opacity-40">☁️</div>
                    <p className="text-2xl text-gray-400">
                        {searchTerm ? 'No files match your search' : 'Your vault is empty'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {filteredFiles.map((file) => (
                            <motion.div
                                key={file.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-gray-900 border border-gray-800 rounded-3xl p-6 hover:border-blue-600/50 transition-all group"
                            >
                                <div className="flex justify-center mb-5">
                                    {getFileIcon(file.fileName)}
                                </div>

                                <p className="font-medium text-center line-clamp-2 min-h-[48px] text-white break-words">
                                    {file.fileName}
                                </p>

                                <p className="text-xs text-gray-500 text-center mt-3">
                                    {formatFileSize(file.size)} • {new Date(file.uploadTime).toLocaleDateString()}
                                </p>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-4 gap-3 mt-8">
                                    <button
                                        onClick={() => copyPresignedLink(file.id)}
                                        className="flex flex-col items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Copy size={20} />
                                        Link
                                    </button>

                                    <button
                                        onClick={() => window.open(`/files/download-file/${file.id}`, '_blank')}
                                        className="flex flex-col items-center gap-1.5 text-xs text-gray-400 hover:text-emerald-400 transition-colors"
                                    >
                                        <Download size={20} />
                                        Download
                                    </button>

                                    <button
                                        onClick={() => handleShare(file.id, file.fileName)}
                                        className="flex flex-col items-center gap-1.5 text-xs text-gray-400 hover:text-violet-400 transition-colors"
                                    >
                                        <Share2 size={20} />
                                        Share
                                    </button>

                                    <button
                                        onClick={() => deleteFile(file.id, file.fileName)}
                                        className="flex flex-col items-center gap-1.5 text-xs text-red-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={20} />
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* ==================== SHARE MODAL ==================== */}
            <AnimatePresence>
                {showShareModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-gray-900 rounded-3xl p-8 w-full max-w-md border border-gray-700"
                        >
                            <h3 className="text-2xl font-semibold mb-2">Share File</h3>
                            <p className="text-gray-400 mb-6">"{selectedFileName}"</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        Password Protection (Optional)
                                    </label>
                                    <input
                                        type="password"
                                        value={sharePassword}
                                        onChange={(e) => setSharePassword(e.target.value)}
                                        placeholder="Leave empty for anyone with link"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-violet-500"
                                    />
                                </div>

                                {generatedLink && (
                                    <div className="bg-gray-800 p-4 rounded-2xl break-all">
                                        <p className="text-xs text-gray-400 mb-1">Share Link:</p>
                                        <p className="text-sm text-violet-400">{generatedLink}</p>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setShowShareModal(false)}
                                        className="flex-1 py-3.5 rounded-2xl border border-gray-700 hover:bg-gray-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={generateShareLink}
                                        disabled={isGenerating}
                                        className="flex-1 py-3.5 bg-violet-600 hover:bg-violet-700 rounded-2xl font-medium transition-all disabled:opacity-70"
                                    >
                                        {isGenerating ? "Generating..." : "Generate & Copy Link"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;