export default function MTLogo({ className = '', size, style, alt = 'Meta Trade' }) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      width={size}
      height={size}
      className={'object-contain select-none ' + className}
      style={style}
      draggable={false}
    />
  );
}
