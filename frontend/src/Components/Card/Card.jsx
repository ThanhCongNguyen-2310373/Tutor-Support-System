import React from "react";
import "./Card.css";

export default function Card({
  title,
  icon,                 // string (src) hoặc React element (SVG)
  iconColor,
  iconSize = 160,
  onClick,
  className = "",

  // --- mới thêm ---
  download = 0,         // 0: ẩn, 1: hiện nút Tải xuống
  share = 0,            // 0: ẩn, 1: hiện nút Chia sẻ
  onDownload,           // () => void
  onShare,              // () => void
}) {
  const isString = typeof icon === "string";

  const renderIcon = () => {
    if (!icon) return null;

    // SVG React element
    if (!isString && React.isValidElement(icon)) {
      return React.cloneElement(icon, {
        className: ["card-icon", icon.props.className].filter(Boolean).join(" "),
        "aria-hidden": true,
        style: { ...(icon.props.style || {}), color: iconColor },
        width: iconSize,
        height: iconSize,
      });
    }

    // string src: hỗ trợ tô màu bằng mask nếu có iconColor
    if (isString) {
      if (iconColor) {
        return (
          <span
            aria-hidden="true"
            className="card-icon card-icon--mask"
            style={{
              width: iconSize,
              height: iconSize,
              backgroundColor: iconColor,
              WebkitMaskImage: `url(${icon})`,
              maskImage: `url(${icon})`,
            }}
          />
        );
      }
      return (
        <img
          src={icon}
          alt=""
          aria-hidden="true"
          className="card-icon"
          style={{ width: iconSize, height: iconSize }}
        />
      );
    }
    return null;
  };

  const showActions = !!download || !!share;

  return (
    <button
      type="button"
      className={`card ${className}`}
      onClick={onClick}
      aria-label={title}
    >
      <div className="card-inner">
        {renderIcon()}
        {title && <div className="card-title">{title}</div>}

        {showActions && (
          <div className="card-actions" onClick={(e)=>e.stopPropagation()}>
            {download ? (
              <button
                type="button"
                className="card-mini-btn"
                onClick={onDownload}
              >
                Tải xuống
              </button>
            ) : null}
            {share ? (
              <button
                type="button"
                className="card-mini-btn"
                onClick={onShare}
              >
                Chia sẻ
              </button>
            ) : null}
          </div>
        )}
      </div>
    </button>
  );
}
