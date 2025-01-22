import { createVar } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

export const vars = {
  indicatorColor: ['--tree-drop-indicator-color', '#579dff'],
  indicatorColorBlocked: ['--tree-drop-indicator-color-blocked', '#cf9f02'],
  terminalSize: ['--tree-drop-indicator-terminal-size', '8px'],
  indicatorThickness: ['--tree-drop-indicator-thickness', '2px'],
  lineThickness: ['--tree-drop-indicator-line-thickness', '2px'],
} as const

function v(name: readonly [string, string]) {
  return `var(${name[0]}, ${name[1]})`
}

export const horizontalIntent = createVar()

export const lineStyles = recipe({
  base: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: horizontalIntent,
    bottom: 0,
    pointerEvents: 'none',
    selectors: {
      '&::before': {
        display: 'block',
        content: '""',
        position: 'absolute',
        zIndex: 2,
        boxSizing: 'border-box',
        width: v(vars.terminalSize),
        height: v(vars.terminalSize),
        left: 0,
        background: 'transparent',
        border: `${v(vars.indicatorColor)} solid ${v(vars.lineThickness)}`,
        borderRadius: '50%',
      },
      '&::after': {
        display: 'block',
        content: '""',
        position: 'absolute',
        zIndex: 1,
        background: v(vars.indicatorColor),
        left: `calc(var(${vars.terminalSize}) / 2)`,
        height: `var(${vars.lineThickness})`,
        right: 0,
      },
    },
  },
  variants: {
    side: {
      above: {
        selectors: {
          '&::before': {
            top: 0,
            transform: `translate(calc(-0.5 * ${v(vars.terminalSize)}), calc(-0.5 * ${v(vars.terminalSize)}))`,
          },
          '&::after': {
            top: `calc(-0.5 * ${v(vars.lineThickness)})`,
          },
        },
      },
      below: {
        selectors: {
          '&::before': {
            bottom: 0,
            transform: `translate(calc(-0.5 * ${v(vars.terminalSize)}), calc(0.5 * ${v(vars.terminalSize)}))`,
          },
          '&::after': {
            bottom: `calc(-0.5 * ${v(vars.lineThickness)})`,
          },
        },
      },
    },
    blocked: {
      true: {
        vars: {
          [vars.indicatorColor[0]]: v(vars.indicatorColorBlocked),
        },
      },
    },
  },
})

export const outlineStyles = recipe({
  base: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: horizontalIntent,
    bottom: 0,
    pointerEvents: 'none',
    border: `${v(vars.indicatorColor)} solid ${v(vars.indicatorThickness)}`,
    borderRadius: '3px',
  },
  variants: {
    blocked: {
      true: {
        vars: {
          [vars.indicatorColor[0]]: v(vars.indicatorColorBlocked),
        },
      },
    },
  },
})
