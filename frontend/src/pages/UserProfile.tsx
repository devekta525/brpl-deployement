import { useEffect, useState, useRef } from "react";
import { getProfile } from "@/apihelper/auth";
import api from "@/apihelper/api";
import { Loader2, ArrowLeft, Lock } from "lucide-react";
import TrialPass from "@/components/TrialPass";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const UserProfile = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await getProfile();
            setProfile(response.data?.data || response.data);
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Invalid file type",
                description: "Please upload an image file (JPEG, PNG, etc).",
                variant: "destructive"
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({
                title: "File too large",
                description: "Image size should be less than 5MB.",
                variant: "destructive"
            });
            return;
        }

        setUploadingImage(true);
        const formData = new FormData();
        formData.append('profileImage', file);

        try {
            const response = await api.post('/auth/upload-profile-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data?.data?.profileImage || response.data?.profileImage) {
                // Update local profile state with new image
                const newImageUrl = response.data?.data?.profileImage || response.data?.profileImage;
                setProfile({ ...profile, profileImage: newImageUrl });
                toast({
                    title: "Success",
                    description: "Profile image updated successfully!",
                });
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error: any) {
            console.error("Image upload failed", error);
            toast({
                title: "Upload Failed",
                description: error.response?.data?.message || "Something went wrong while uploading your image.",
                variant: "destructive"
            });
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Reset input
            }
        }
    };

    const handleDownload = async () => {
        try {
            // Create a temporary canvas
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 1020;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Could not create canvas context");

            // 1. Draw Background
            const bgImg = new Image();
            bgImg.crossOrigin = "anonymous";
            await new Promise((resolve, reject) => {
                bgImg.onload = resolve;
                bgImg.onerror = reject;
                bgImg.src = '/assets/trail-pass-bg.png';
            });
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

            // 2. Draw Profile Image with rounded corners and border
            const profImg = new Image();

            // Getting the actual visible image element src bypasses duplicate request logic
            const renderedProfileImg = document.querySelector('#brpl-trial-pass img') as HTMLImageElement;
            let loadUrl = renderedProfileImg ? renderedProfileImg.src : (profile?.profileImage || '/assets/hero-player.png');

            // If the rendered image is external and NOT proxy wrapped or base64, ensure we fetch it safely
            if (loadUrl && !loadUrl.startsWith('data:') && !loadUrl.startsWith('blob:') && !loadUrl.startsWith('/') && !loadUrl.includes('localhost') && !loadUrl.includes(window.location.host) && !loadUrl.includes('api.allorigins.win')) {
                try {
                    const proxiedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(loadUrl)}`;
                    const res = await fetch(proxiedUrl, { cache: 'no-store' });
                    const blob = await res.blob();
                    loadUrl = URL.createObjectURL(blob);
                } catch (e) {
                    console.warn("Blob fetch failed", e);
                }
            } else if (loadUrl && !loadUrl.startsWith('data:') && !loadUrl.startsWith('blob:') && !loadUrl.startsWith('/')) {
                profImg.crossOrigin = "anonymous";
            }

            try {
                await new Promise((resolve, reject) => {
                    profImg.onload = resolve;
                    // If the first attempt fails, fallback immediately to default local player
                    profImg.onerror = () => {
                        console.warn("Image load failed fallback triggered for URL:", loadUrl.substring(0, 100));
                        profImg.onload = resolve;
                        profImg.onerror = reject;
                        profImg.removeAttribute("crossOrigin");
                        profImg.src = '/assets/hero-player.png';
                    };
                    profImg.src = loadUrl;
                });

                const x = 180;
                const y = 236;
                const size = 440;
                const radius = 44;
                const borderWidth = 6;

                // Draw solid background in case image has transparency
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + size - radius, y);
                ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
                ctx.lineTo(x + size, y + size - radius);
                ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
                ctx.lineTo(x + radius, y + size);
                ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.closePath();
                ctx.fillStyle = "#5c667a";
                ctx.fill();
                ctx.clip();

                // Draw image covering the square proportionally
                const scale = Math.max(size / profImg.width, size / profImg.height);
                const drawWidth = profImg.width * scale;
                const drawHeight = profImg.height * scale;
                const drawX = x + (size - drawWidth) / 2;
                const drawY = y + (size - drawHeight) / 2;

                ctx.drawImage(profImg, drawX, drawY, drawWidth, drawHeight);
                ctx.restore();

                // Draw border
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + size - radius, y);
                ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
                ctx.lineTo(x + size, y + size - radius);
                ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
                ctx.lineTo(x + radius, y + size);
                ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.closePath();
                ctx.lineWidth = borderWidth;
                ctx.strokeStyle = '#24324a';
                ctx.stroke();
            } catch (imgErr) {
                console.warn("Failed to draw profile image on canvas:", imgErr);
                // Continue drawing text even if image fails
            }

            // 3. Draw Name
            const fullName = (`${profile?.fname || ''} ${profile?.lname || ''}`.trim() || 'User');
            ctx.fillStyle = '#000000';
            ctx.font = '600 52px Poppins, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(fullName, canvas.width / 2, 730);

            // 4. Draw Barcode (Grab it from the hidden SVG rendered by react-barcode)
            try {
                const passElement = document.getElementById("brpl-trial-pass");
                const svg = passElement?.querySelector('svg');
                if (svg) {
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                    const svgUrl = URL.createObjectURL(svgBlob);

                    const barcodeImg = new Image();
                    await new Promise((resolve, reject) => {
                        barcodeImg.onload = resolve;
                        barcodeImg.onerror = reject;
                        barcodeImg.src = svgUrl;
                    });

                    // Draw centered barcode
                    const bcWidth = barcodeImg.width * 2;
                    const bcHeight = barcodeImg.height * 2;
                    ctx.drawImage(barcodeImg, (canvas.width - bcWidth) / 2, 770, bcWidth, bcHeight);
                    URL.revokeObjectURL(svgUrl);
                }
            } catch (bcErr) {
                console.warn("Failed to draw barcode on canvas:", bcErr);
            }

            // Export and download
            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = `BRPL-Pass-${fullName}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: "Download Complete",
                description: "Your Trial Pass has been downloaded successfully.",
            });
        } catch (error: any) {
            console.error("Error generating pass image:", error);
            toast({
                title: "Download Failed",
                description: `Failed to generate pass image: ${error?.message || error}. Please try again.`,
                variant: "destructive"
            });
        }
    };
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-12 flex flex-col items-center">
                <p className="text-lg text-muted-foreground mb-4">Profile not found</p>
                <button onClick={() => navigate(-1)} className="text-primary hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
            </div>
        );
    }

    // "show only thier destails and their trail pass exact same as provided image"
    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
            <div>
                <h1 className="text-3xl font-display font-bold">My Profile</h1>
                <p className="text-muted-foreground">Manage your details and view your exclusive Trial Pass.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Details Section */}
                <div className="glass-card p-6 md:col-span-5 h-fit shadow-lg shadow-black/5 border-none">
                    <h2 className="text-xl font-semibold border-b pb-4 mb-4">Personal Details</h2>
                    <div className="space-y-5">
                        <div className="bg-secondary/20 p-4 rounded-xl">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Full Name</p>
                            <p className="font-semibold text-lg">{profile.fname} {profile.lname}</p>
                        </div>
                        <div className="bg-secondary/20 p-4 rounded-xl">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Email Address</p>
                            <p className="font-semibold text-lg">{profile.email}</p>
                        </div>
                        <div className="bg-secondary/20 p-4 rounded-xl">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Mobile Number</p>
                            <p className="font-semibold text-lg">{profile.mobile || "N/A"}</p>
                        </div>
                        <div className="bg-secondary/20 p-4 rounded-xl">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Role / Affiliation</p>
                            <p className="font-semibold text-lg capitalize">{profile.playerRole || profile.role || "Player"}</p>
                        </div>
                        <div className="bg-secondary/20 p-4 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                                <p className="font-semibold text-lg">
                                    {profile.isPaid ? "Paid Member" : "Registered User"}
                                </p>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${profile.isPaid ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)] animate-pulse'}`}></div>
                        </div>
                    </div>
                </div>

                {/* Trial Pass Section */}
                {profile.isPaid ? (
                    <div className="md:col-span-7 flex flex-col items-center justify-center p-8 bg-black/5 dark:bg-white/5 rounded-3xl inner-shadow border border-border">
                        <h3 className="text-2xl font-bold mb-6 text-center w-full">Your BRPL Trial Pass</h3>

                        {/* Trial Pass component rendering exactly as image */}
                        <div id="trial-pass-container" className="transform md:hover:scale-105 transition-transform duration-500 ease-out origin-top relative group">
                            <TrialPass user={profile} />

                            {/* Overlay to indicate it's clickable for upload if we wanted, but we will use an explicit button instead */}
                            <div className="absolute inset-x-0 top-[115px] flex justify-center pointer-events-none">
                                {uploadingImage && (
                                    <div className="absolute z-50 bg-black/60 text-white flex items-center justify-center rounded-[22px] w-[220px] h-[220px]">
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />

                        <div className="mt-8 flex flex-wrap justify-center gap-4 w-full">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                                className="bg-secondary text-secondary-foreground border border-border px-6 py-2 rounded-lg font-medium shadow hover:bg-secondary/80 transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                {uploadingImage ? "Uploading..." : "Update Photo"}
                            </button>
                            <button
                                onClick={handleDownload}
                                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium shadow-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                            >
                                Download Pass
                            </button>
                        </div>

                        <p className="text-sm text-muted-foreground mt-6 text-center max-w-sm">
                            This digital pass grants you access to all selected events and tryouts valid under the BRPL 2026 season.
                        </p>
                    </div>
                ) : (
                    <div className="md:col-span-7 flex flex-col items-center justify-center p-12 bg-black/5 dark:bg-white/5 rounded-3xl border border-border text-center h-full min-h-[400px]">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-3xl font-display font-bold mb-4">Trial Pass Locked</h3>
                        <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
                            Complete your registration payment to unlock and download your official BRPL Trial Pass.
                        </p>
                        <Link to="/dashboard" className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-105 transition-all inline-flex items-center gap-2 text-lg">
                            Complete Payment
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
