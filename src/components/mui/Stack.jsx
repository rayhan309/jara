"use client";

import { createStack } from "@mui/system";
import { styled } from "@mui/material/styles";
import { useDefaultProps } from "@mui/material/DefaultPropsProvider";

const MuiStack = createStack({
  createStyledComponent: styled("div", {
    name: "MuiStack",
    slot: "Root",
  }),
  useThemeProps: (inProps) =>
    useDefaultProps({
      props: inProps,
      name: "MuiStack",
    }),
});

/** System props removed in MUI v9 — map them into `sx` so they don't leak to the DOM. */
const SYSTEM_PROP_KEYS = [
  "alignItems",
  "justifyContent",
  "flexWrap",
  "alignContent",
  "alignSelf",
  "justifyItems",
  "justifySelf",
  "textAlign",
  "flex",
  "flexGrow",
  "flexShrink",
  "width",
  "height",
  "minWidth",
  "minHeight",
  "maxWidth",
  "maxHeight",
  "m",
  "mt",
  "mr",
  "mb",
  "ml",
  "mx",
  "my",
  "p",
  "pt",
  "pr",
  "pb",
  "pl",
  "px",
  "py",
  "gap",
  "rowGap",
  "columnGap",
  "bgcolor",
  "color",
];

export default function Stack({ sx, ...props }) {
  const systemSx = {};
  const rest = { ...props };

  for (const key of SYSTEM_PROP_KEYS) {
    if (Object.prototype.hasOwnProperty.call(rest, key) && rest[key] != null) {
      systemSx[key] = rest[key];
      delete rest[key];
    }
  }

  const mergedSx = Object.keys(systemSx).length
    ? [systemSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]
    : sx;

  return <MuiStack {...rest} sx={mergedSx} />;
}
