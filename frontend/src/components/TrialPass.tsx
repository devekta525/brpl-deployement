import ReactBarcode from 'react-barcode';

interface TrialPassProps {
    user?: any;
}

const TrialPass = ({ user }: TrialPassProps) => {
    // Default values mimicking the provided image
    const fullName = user ? (`${user.fname || ''} ${user.lname || ''}`.trim() || 'Sushil Sharma') : 'Sushil Sharma';
    const profileImage = user?.profileImage || '/assets/hero-player.png'; // Will use a default if available, or fallback
    const barcodeValue = String(user?.userId || user?._id || '1234567890123');

    return (
        <div className="relative w-[400px] h-[510px] bg-white rounded-[24px] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.15)] select-none shrink-0 mx-auto"
            style={{
                border: '4px solid #2f3e56', // The dark blue/gray border of the card
                fontFamily: '"Inter", sans-serif',
            }}
        >
            {/* Background SVG Graphics */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 510" preserveAspectRatio="none">
                {/* Left side Saffron swooshes */}
                <path d="M 0,110 C 130,120 180,200 150,350 L 0,350 Z" fill="#e28639" />
                <path d="M 0,140 C 120,150 160,210 120,330 L 0,330 Z" fill="#cd671b" />

                {/* Right side Grey swooshes */}
                <path d="M 400,210 C 270,190 220,300 240,420 L 400,420 Z" fill="#e4e4e4" />
                <path d="M 400,240 C 290,220 260,310 270,400 L 400,400 Z" fill="#cfcfcf" />

                {/* Bottom arcs */}
                <path d="M 120,510 Q 200,470 280,510" fill="none" stroke="#d26e25" strokeWidth="2.5" />
                <path d="M 150,510 Q 200,485 250,510" fill="none" stroke="#253245" strokeWidth="3.5" />
            </svg>

            {/* Top Cutout */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[52px] h-[26px] bg-[#d16b23] rounded-b-full z-10" />

            <div className="relative z-10 w-full h-full flex flex-col pt-[26px] px-6 pb-4">
                {/* Header */}
                <div className="w-full flex justify-between items-start">
                    <img src="/logo.png" alt="BRPL Logo" className="w-[105px] object-contain ml-0.5" loading="lazy" decoding="async" />
                    <div className="flex flex-col items-end mr-0.5" style={{ fontFamily: '"Poppins", sans-serif' }}>
                        <span className="text-[#ce661a] font-bold text-[13px] tracking-wide">BRPL Trial Pass</span>
                        <span className="text-[#19273f] font-black text-[3.4rem] leading-[0.95] tracking-tighter mt-0">2026</span>
                        <span className="text-gray-900 text-[10px] font-bold tracking-widest mt-1">Vallid Till : 31/07/2026</span>
                    </div>
                </div>

                {/* Photo Area */}
                <div className="mt-[22px] flex-1 w-full flex flex-col items-center justify-start">
                    <div className="w-[240px] h-[240px] rounded-[1.25rem] overflow-hidden shadow-md bg-[#556073]" style={{ border: '4px solid #2f3e56' }}>
                        {profileImage ? (
                            <img src={profileImage} alt={fullName} className="w-full h-full object-cover object-top" loading="lazy" decoding="async" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#556073] text-white text-[4rem] font-black">
                                {fullName.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>

                {/* User Info */}
                <div className="mt-[-8px] text-center pb-2">
                    <h2 className="text-[#000] text-[28px] font-bold tracking-tight mb-[10px] leading-none" style={{ fontFamily: '"Poppins", sans-serif' }}>
                        {fullName}
                    </h2>
                    <div className="flex justify-center mix-blend-multiply opacity-95 mx-auto px-4 scale-x-105">
                        <ReactBarcode
                            value={barcodeValue}
                            width={1.6}
                            height={45}
                            displayValue={false}
                            background="transparent"
                            lineColor="#000000"
                            margin={0}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto text-center font-medium italic text-[#1c2c44] text-[11px] tracking-wide pb-1">
                    Bharat ki League, Bhartiyo ka Sapna.
                </div>
            </div>
        </div>
    );
};

export default TrialPass;
