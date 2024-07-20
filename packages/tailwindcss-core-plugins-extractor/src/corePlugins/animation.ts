export default {
  ".animate-none": [
    null,
    {
      "animation": "none"
    }
  ],
  ".animate-spin": [
    {
      "@keyframes undefinedspin": {
        "to": {
          "transform": "rotate(360deg)"
        }
      }
    },
    {
      "animation": "undefinedspin 1s linear infinite"
    }
  ],
  ".animate-ping": [
    {
      "@keyframes undefinedping": {
        "75%, 100%": {
          "transform": "scale(2)",
          "opacity": "0"
        }
      }
    },
    {
      "animation": "undefinedping 1s cubic-bezier(0, 0, 0.2, 1) infinite"
    }
  ],
  ".animate-pulse": [
    {
      "@keyframes undefinedpulse": {
        "50%": {
          "opacity": ".5"
        }
      }
    },
    {
      "animation": "undefinedpulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
    }
  ],
  ".animate-bounce": [
    {
      "@keyframes undefinedbounce": {
        "0%, 100%": {
          "transform": "translateY(-25%)",
          "animation-timing-function": "cubic-bezier(0.8,0,1,1)"
        },
        "50%": {
          "transform": "none",
          "animation-timing-function": "cubic-bezier(0,0,0.2,1)"
        }
      }
    },
    {
      "animation": "undefinedbounce 1s infinite"
    }
  ]
}