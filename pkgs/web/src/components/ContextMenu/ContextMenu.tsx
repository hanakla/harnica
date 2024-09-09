import { css } from "@emotion/react";
import { ComponentProps, useMemo } from "react";
import { UseContextMenuParams } from "react-contexify";
import { Item, Menu, useContextMenu as _useContextMenu } from "react-contexify";
import "react-contexify/ReactContexify.css";

export const useContextMenu = function <TProps>(
  props: Partial<UseContextMenuParams<TProps>> & {
    onContextMenu: (
      event: React.MouseEvent<HTMLElement>,
      menu: ReturnType<typeof _useContextMenu>,
    ) => void;
  },
) {
  const menu = _useContextMenu(props);

  return useMemo(
    () => ({
      ...menu,
      handleContextEvent: <T extends HTMLElement>(
        event: React.MouseEvent<T>,
      ) => {
        event.stopPropagation();
        props.onContextMenu(event, menu);
      },
    }),
    [menu, props.onContextMenu],
  );
};

export const ContextMenu = (props: ComponentProps<typeof Menu>) => {
  return (
    <Menu
      css={css`
        padding: 4px;
      `}
      {...props}
    />
  );
};

export const MenuItem = (props: ComponentProps<typeof Item>) => {
  return (
    <Item
      css={css`
        font-size: 12px;
        --contexify-itemContent-padding: 4px;
      `}
      {...props}
    />
  );
};
