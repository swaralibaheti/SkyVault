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
        if (['jpg', 'png', 'gif', 'jpeg', 'webp'].includes(ext || '')) return <Image size={48} style={{ color: '#ec4899' }} />;
        if (['mp4', 'mov', 'avi'].includes(ext || '')) return <Video size={48} style={{ color: '#a855f7' }} />;
        if (['mp3', 'wav'].includes(ext || '')) return <Music size={48} style={{ color: '#f59e0b' }} />;
        return <FileText size={48} style={{ color: '#3b82f6' }} />;
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

    // ==================== SHARE FUNCTIONALITY ====================
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
        <div
            style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '24px',
                padding: '32px 24px',
                animation: 'pulse 1.5s infinite',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px' }} />
            </div>
            <div style={{ height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', width: '75%', margin: '0 auto 12px' }} />
            <div style={{ height: '14px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', width: '50%', margin: '0 auto' }} />
        </div>
    );

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
                padding: '40px 24px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
        >
            {/* Futuristic background glow */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.25) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: -1,
                }}
            />

            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '48px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <h1
                                style={{
                                    fontSize: '42px',
                                    fontWeight: '700',
                                    color: '#ffffff',
                                    letterSpacing: '-2px',
                                }}
                            >
                                My SkyVault
                            </h1>
                            <p style={{ color: '#94a3b8', fontSize: '20px', marginTop: '4px' }}>
                                Secure Cloud Storage
                            </p>
                        </div>

                        <label
                            style={{
                                cursor: 'pointer',
                                background: 'linear-gradient(90deg, #3b82f6, #22d3ee)',
                                color: 'white',
                                padding: '18px 32px',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                fontWeight: '600',
                                fontSize: '18px',
                                boxShadow: '0 15px 35px -10px rgba(59, 130, 246, 0.7)',
                            }}
                        >
                            <Upload size={24} />
                            Upload New File
                            <input type="file" className="hidden" onChange={handleFileSelect} />
                        </label>
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <Search
                            size={24}
                            style={{
                                position: 'absolute',
                                left: '24px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#64748b',
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Search your files..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '20px 24px 20px 68px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '16px',
                                color: 'white',
                                fontSize: '17px',
                                outline: 'none',
                                backdropFilter: 'blur(12px)',
                            }}
                        />
                    </div>
                </div>

                {/* Drag & Drop Zone */}
                <motion.div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                        border: `2px dashed ${isDragging ? '#3b82f6' : 'rgba(255,255,255,0.25)'}`,
                        borderRadius: '24px',
                        padding: '80px 40px',
                        textAlign: 'center',
                        marginBottom: '48px',
                        background: isDragging ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)',
                        transition: 'all 0.3s',
                    }}
                >
                    <Upload size={72} style={{ margin: '0 auto 24px', color: '#64748b' }} />
                    <p style={{ fontSize: '28px', fontWeight: '600', color: '#ffffff' }}>Drop files here</p>
                    <p style={{ color: '#94a3b8', marginTop: '8px' }}>or use the upload button above</p>
                </motion.div>

                {/* Upload Progress */}
                <AnimatePresence>
                    {isUploading && (
                        <div
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '24px',
                                padding: '24px',
                                marginBottom: '48px',
                                backdropFilter: 'blur(12px)',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '15px' }}>
                                <span style={{ color: '#94a3b8' }}>Uploading...</span>
                                <span style={{ color: '#ffffff' }}>{uploadProgress}%</span>
                            </div>
                            <div
                                style={{
                                    height: '10px',
                                    background: 'rgba(255,255,255,0.15)',
                                    borderRadius: '9999px',
                                    overflow: 'hidden',
                                }}
                            >
                                <motion.div
                                    style={{
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #3b82f6, #22d3ee)',
                                        borderRadius: '9999px',
                                    }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Files Grid */}
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                        {[...Array(6)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                        <div style={{ fontSize: '80px', marginBottom: '24px', opacity: 0.3 }}>☁️</div>
                        <p style={{ fontSize: '28px', color: '#94a3b8' }}>
                            {searchTerm ? 'No files match your search' : 'Your vault is empty'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                        <AnimatePresence>
                            {filteredFiles.map((file) => (
                                <motion.div
                                    key={file.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        borderRadius: '24px',
                                        padding: '32px 24px',
                                        backdropFilter: 'blur(16px)',
                                        transition: 'all 0.3s',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                                        {getFileIcon(file.fileName)}
                                    </div>

                                    <p
                                        style={{
                                            fontSize: '18px',
                                            fontWeight: '600',
                                            textAlign: 'center',
                                            color: '#ffffff',
                                            marginBottom: '12px',
                                            lineHeight: '1.3',
                                        }}
                                    >
                                        {file.fileName}
                                    </p>

                                    <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center' }}>
                                        {formatFileSize(file.size)} • {new Date(file.uploadTime).toLocaleDateString()}
                                    </p>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '32px' }}>
                                        <button
                                            onClick={() => copyPresignedLink(file.id)}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '4px',
                                                background: 'none',
                                                border: 'none',
                                                color: '#94a3b8',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                            }}
                                        >
                                            <Copy size={22} />
                                            Link
                                        </button>

                                        <button
                                            onClick={() => window.open(`/files/download-file/${file.id}`, '_blank')}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '4px',
                                                background: 'none',
                                                border: 'none',
                                                color: '#94a3b8',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                            }}
                                        >
                                            <Download size={22} />
                                            Download
                                        </button>

                                        <button
                                            onClick={() => handleShare(file.id, file.fileName)}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '4px',
                                                background: 'none',
                                                border: 'none',
                                                color: '#94a3b8',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                            }}
                                        >
                                            <Share2 size={22} />
                                            Share
                                        </button>

                                        <button
                                            onClick={() => deleteFile(file.id, file.fileName)}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '4px',
                                                background: 'none',
                                                border: 'none',
                                                color: '#f87171',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                            }}
                                        >
                                            <Trash2 size={22} />
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
                        <div
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(0,0,0,0.85)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 9999,
                            }}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                style={{
                                    background: 'rgba(15, 23, 42, 0.95)',
                                    backdropFilter: 'blur(40px)',
                                    border: '1px solid rgba(255,255,255,0.18)',
                                    borderRadius: '28px',
                                    padding: '40px',
                                    width: '100%',
                                    maxWidth: '440px',
                                }}
                            >
                                <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
                                    Share File
                                </h3>
                                <p style={{ color: '#94a3b8', marginBottom: '32px' }}>"{selectedFileName}"</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                                    <div>
                                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '15px', marginBottom: '8px' }}>
                                            Password Protection (Optional)
                                        </label>
                                        <input
                                            type="password"
                                            value={sharePassword}
                                            onChange={(e) => setSharePassword(e.target.value)}
                                            placeholder="Leave empty for anyone with link"
                                            style={{
                                                width: '100%',
                                                padding: '18px 24px',
                                                background: 'rgba(255,255,255,0.1)',
                                                border: '1px solid rgba(255,255,255,0.15)',
                                                borderRadius: '16px',
                                                color: 'white',
                                                fontSize: '17px',
                                                outline: 'none',
                                                backdropFilter: 'blur(12px)',
                                            }}
                                        />
                                    </div>

                                    {generatedLink && (
                                        <div
                                            style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                padding: '20px',
                                                borderRadius: '16px',
                                                border: '1px solid rgba(255,255,255,0.15)',
                                            }}
                                        >
                                            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>Share Link:</p>
                                            <p style={{ color: '#22d3ee', wordBreak: 'break-all', fontSize: '15px' }}>
                                                {generatedLink}
                                            </p>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <button
                                            onClick={() => setShowShareModal(false)}
                                            style={{
                                                flex: 1,
                                                padding: '18px',
                                                background: 'transparent',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                color: '#94a3b8',
                                                borderRadius: '16px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={generateShareLink}
                                            disabled={isGenerating}
                                            style={{
                                                flex: 1,
                                                padding: '18px',
                                                background: 'linear-gradient(90deg, #3b82f6, #22d3ee)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '16px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {isGenerating ? 'Generating...' : 'Generate & Copy Link'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Spinner Animation */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;