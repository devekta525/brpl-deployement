import { useEffect, useState } from "react";
import { getProfile } from "@/apihelper/auth";
import { Loader2, ArrowLeft } from "lucide-react";
import TrialPass from "@/components/TrialPass";
import { Link, useNavigate } from "react-router-dom";

const UserProfile = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
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
        fetchProfile();
    }, []);

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
                <div className="md:col-span-7 flex flex-col items-center justify-center p-8 bg-black/5 dark:bg-white/5 rounded-3xl inner-shadow border border-border">
                    <h3 className="text-2xl font-bold mb-6 text-center w-full">Your BRPL Trial Pass</h3>

                    {/* Trial Pass component rendering exactly as image */}
                    <div className="transform md:hover:scale-105 transition-transform duration-500 ease-out origin-top">
                        <TrialPass user={profile} />
                    </div>

                    <p className="text-sm text-muted-foreground mt-8 text-center max-w-sm">
                        This digital pass grants you access to all selected events and tryouts valid under the BRPL 2026 season.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
