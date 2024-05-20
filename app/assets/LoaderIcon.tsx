const LoaderIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width="50"
    height="50"
  >
    <circle
      fill="rgb(59 130 246)"
      stroke="rgb(59 130 246)"
      stroke-width="3"
      r="5"
      cx="20"
      cy="50"
    >
      <animate
        attributeName="cy"
        calcMode="spline"
        dur="2s"
        values="50;80;50;"
        keySplines=".5 0 .5 1;.5 0 .5 1"
        repeatCount="indefinite"
        begin="-.4s"
      ></animate>
    </circle>
    <circle
      fill="rgb(59 130 246)"
      stroke="rgb(59 130 246)"
      stroke-width="3"
      r="5"
      cx="50"
      cy="50"
    >
      <animate
        attributeName="cy"
        calcMode="spline"
        dur="2s"
        values="50;80;50;"
        keySplines=".5 0 .5 1;.5 0 .5 1"
        repeatCount="indefinite"
        begin="-.2s"
      ></animate>
    </circle>
    <circle
      fill="rgb(59 130 246)"
      stroke="rgb(59 130 246)"
      stroke-width="3"
      r="5"
      cx="80"
      cy="50"
    >
      <animate
        attributeName="cy"
        calcMode="spline"
        dur="2s"
        values="50;80;50;"
        keySplines=".5 0 .5 1;.5 0 .5 1"
        repeatCount="indefinite"
      ></animate>
    </circle>
  </svg>
);

export default LoaderIcon;
