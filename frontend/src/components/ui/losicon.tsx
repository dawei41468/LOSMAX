interface LosIconProps {
  size?: number; // Size in pixels (default 112 matches original w-28)
}

export const LosIcon = ({ size = 112 }: LosIconProps) => {
  // Exact pixel dimensions at base size (112px)
  const baseSize = 112;
  const ratio = size / baseSize;
  
  // Fixed dimensions at 112px
  const oSection = { width: 84, height: 56 };  // 75% x 50%
  const sSection = { width: 56, height: 84 };  // 50% x 75%
  const bar = { width: 28, height: 28 };       // 25% x 25%
  const borderRadius = 8;
  const textSize = Math.max(12, Math.round(24 * ratio)); // Min 12px

  const containerStyle = {
    width: `${size}px`,
    height: `${size}px`
  };

  return (
    <div className="relative" style={containerStyle}>
      {/* Polished O section */}
      {/* Polished O section */}
      <div className="absolute top-0 left-0"
           style={{
             width: `${oSection.width * ratio}px`,
             height: `${oSection.height * ratio}px`,
             background: 'linear-gradient(135deg, #4f46e5, #8b5cf6, #10b981)',
             borderRadius: `${borderRadius * ratio}px 0 0 0`
           }}>
      </div>
      
      {/* Polished S section */}
      <div className="absolute bottom-0 right-0"
           style={{
             width: `${sSection.width * ratio}px`,
             height: `${sSection.height * ratio}px`,
             background: 'linear-gradient(315deg, #7c3aed, #10b981, #f59e0b)',
             borderRadius: `0 0 ${borderRadius * ratio}px 0`
           }}>
      </div>
      
      {/* O text */}
      <span className="absolute text-white font-bold"
            style={{
              left: `${30 * ratio}px`,  // 30px at 112px size
              top: `${15 * ratio}px`,   // 15px at 112px size (moved up)
              fontSize: `${textSize}px`
            }}>
        O
      </span>
      
      {/* S text */}
      <span className="absolute text-white font-bold"
            style={{
              right: `${20 * ratio}px`,   // 20px at 112px size
              bottom: `${30 * ratio}px`,  // 30px at 112px size
              fontSize: `${textSize}px`
            }}>
        S
      </span>
      
      {/* Left vertical bar */}
      <div className="absolute top-0 left-0"
           style={{
             width: `${bar.width * ratio}px`,
             height: '100%',
             background: 'linear-gradient(to bottom, #4f46e5, #8b5cf6, #10b981)',
             borderRadius: `${borderRadius * ratio}px 0 0 ${borderRadius * ratio}px`
           }}>
      </div>
      
      {/* Bottom horizontal bar */}
      <div className="absolute bottom-0 left-0"
           style={{
             width: '100%',
             height: `${bar.height * ratio}px`,
             background: 'linear-gradient(to right, #10b981, #8b5cf6, #4f46e5)',
             borderRadius: `0 0 ${borderRadius * ratio}px ${borderRadius * ratio}px`
           }}>
      </div>
    </div>
  );
};