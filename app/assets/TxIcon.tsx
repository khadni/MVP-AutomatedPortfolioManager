const LinkIcon = ({ color = "#737373", size = 21 }) => (
  <svg
    viewBox="0 0 21 21"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke={color}
    width={size}
    height={size}
  >
    <g
      fill="none"
      fillRule="evenodd"
      strokeLinecap="round"
      strokeLinejoin="round"
      transform="translate(4 3)"
    >
      <path d="m12.5 12.5v-10c0-1.1045695-.8954305-2-2-2h-8c-1.1045695 0-2 .8954305-2 2v10c0 1.1045695.8954305 2 2 2h8c1.1045695 0 2-.8954305 2-2z" />
      <path d="m5.5 4.5h5" />
      <path d="m2.5 4.5h1" />
      <path d="m5.5 7.5h5" />
      <path d="m2.5 7.5h1" />
      <path d="m5.5 10.5h5" />
      <path d="m2.5 10.5h1" />
    </g>
  </svg>
);

export default LinkIcon;
