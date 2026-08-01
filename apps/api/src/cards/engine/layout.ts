import { rect } from './helpers.js';

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type PaddingInput = number | Partial<Padding>;

export type Sizing = number | 'auto' | 'fill';

export interface ContainerStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rx?: number;
  ry?: number;
  opacity?: number;
  className?: string;
}

export interface LayoutBaseNode {
  id?: string;
  width?: Sizing;
  height?: Sizing;
  flex?: number;
  padding?: PaddingInput;
}

export interface ContainerNode extends LayoutBaseNode {
  type: 'row' | 'column';
  children: LayoutNode[];
  spacing?: number;
  justifyContent?: 'start' | 'end' | 'center' | 'space-between';
  alignItems?: 'start' | 'end' | 'center' | 'stretch';
  style?: ContainerStyle;
}

export interface LeafNode extends LayoutBaseNode {
  type: 'leaf';
  measure?: (constraints: { maxWidth: number; maxHeight: number }) => {
    width: number;
    height: number;
  };
  render: (x: number, y: number, width: number, height: number) => string;
}

export type LayoutNode = ContainerNode | LeafNode;

export interface ComputedNode {
  node: LayoutNode;
  x: number;
  y: number;
  width: number;
  height: number;
  children?: ComputedNode[];
}

export function getPadding(input?: PaddingInput): Padding {
  if (input === undefined) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  if (typeof input === 'number') {
    return { top: input, right: input, bottom: input, left: input };
  }
  return {
    top: input.top ?? 0,
    right: input.right ?? 0,
    bottom: input.bottom ?? 0,
    left: input.left ?? 0,
  };
}

function resolveDimension(
  size: Sizing | undefined,
  constraint: number,
  measureFn: () => number,
  fallback: number,
): number {
  if (typeof size === 'number') {
    return size;
  }
  if (size === 'fill') {
    return constraint;
  }
  if (size === 'auto') {
    return measureFn();
  }
  return fallback;
}

export function offsetLayout(node: ComputedNode, dx: number, dy: number): void {
  node.x += dx;
  node.y += dy;
  if (node.children) {
    for (const child of node.children) {
      offsetLayout(child, dx, dy);
    }
  }
}

export function computeLayout(
  node: LayoutNode,
  constraintWidth: number,
  constraintHeight: number,
  x = 0,
  y = 0,
): ComputedNode {
  const p = getPadding(node.padding);

  if (node.type === 'leaf') {
    let leafWidth = 0;
    let leafHeight = 0;

    const hasMeasure = !!node.measure;
    const measured = hasMeasure
      ? node.measure!({
          maxWidth: Math.max(0, constraintWidth - p.left - p.right),
          maxHeight: Math.max(0, constraintHeight - p.top - p.bottom),
        })
      : null;

    if (typeof node.width === 'number') {
      leafWidth = node.width;
    } else if (node.width === 'fill') {
      leafWidth = constraintWidth;
    } else if (measured) {
      leafWidth = measured.width + p.left + p.right;
    } else {
      leafWidth = 0;
    }

    if (typeof node.height === 'number') {
      leafHeight = node.height;
    } else if (node.height === 'fill') {
      leafHeight = constraintHeight;
    } else if (measured) {
      leafHeight = measured.height + p.top + p.bottom;
    } else {
      leafHeight = 0;
    }

    return {
      node,
      x,
      y,
      width: Math.min(leafWidth, constraintWidth),
      height: Math.min(leafHeight, constraintHeight),
    };
  }

  // Container nodes (row/column)
  const innerMaxWidth = Math.max(0, constraintWidth - p.left - p.right);
  const innerMaxHeight = Math.max(0, constraintHeight - p.top - p.bottom);
  const spacing = node.spacing ?? 0;
  const totalSpacing = node.children.length > 1 ? spacing * (node.children.length - 1) : 0;

  if (node.type === 'column') {
    // 1. Identify flex children on main axis (height for Column)
    const childStatuses = node.children.map((child) => {
      const isFlex = child.height === 'fill';
      return { child, isFlex, computed: undefined as ComputedNode | undefined };
    });

    // 2. Measure non-flex children (always computed relative to (0,0) first)
    let totalNonFlexHeight = 0;
    for (const status of childStatuses) {
      if (!status.isFlex) {
        const comp = computeLayout(status.child, innerMaxWidth, innerMaxHeight, 0, 0);
        status.computed = comp;
        totalNonFlexHeight += comp.height;
      }
    }

    // 3. Distribute remaining space among flex children
    const remainingHeight = Math.max(0, innerMaxHeight - totalNonFlexHeight - totalSpacing);
    const totalFlex = childStatuses
      .filter((s) => s.isFlex)
      .reduce((sum, s) => sum + (s.child.flex ?? 1), 0);

    // 4. Second pass: compute layouts with correct constraints (relative to (0,0))
    const finalChildren: ComputedNode[] = [];
    let maxChildWidth = 0;
    let totalHeight = totalSpacing;

    for (const status of childStatuses) {
      let childWidthConstraint = innerMaxWidth;
      let childHeightConstraint = 0;

      if (status.isFlex) {
        const flexVal = status.child.flex ?? 1;
        childHeightConstraint = totalFlex > 0 ? (flexVal / totalFlex) * remainingHeight : 0;
      } else {
        childHeightConstraint = status.computed?.height ?? 0;
      }

      const comp = computeLayout(status.child, childWidthConstraint, childHeightConstraint, 0, 0);
      finalChildren.push(comp);
      maxChildWidth = Math.max(maxChildWidth, comp.width);
      totalHeight += comp.height;
    }

    // Determine final dimensions of column container
    let finalWidth = resolveDimension(
      node.width,
      constraintWidth,
      () => maxChildWidth + p.left + p.right,
      maxChildWidth + p.left + p.right,
    );
    let finalHeight = resolveDimension(
      node.height,
      constraintHeight,
      () => totalHeight + p.top + p.bottom,
      totalHeight + p.top + p.bottom,
    );

    // Clip to parent constraints if auto-sized
    if (node.width === undefined || node.width === 'auto') {
      finalWidth = Math.min(finalWidth, constraintWidth);
    }
    if (node.height === undefined || node.height === 'auto') {
      finalHeight = Math.min(finalHeight, constraintHeight);
    }

    const innerWidth = Math.max(0, finalWidth - p.left - p.right);
    const innerHeight = Math.max(0, finalHeight - p.top - p.bottom);

    // Adjust width for children that are 'fill' width or when alignItems is 'stretch'
    const alignItems = node.alignItems ?? 'start';
    for (let i = 0; i < finalChildren.length; i++) {
      const childNode = node.children[i];
      const comp = finalChildren[i];
      if (childNode && comp) {
        if (childNode.width === 'fill' || alignItems === 'stretch') {
          finalChildren[i] = computeLayout(childNode, innerWidth, comp.height, 0, 0);
        }
      }
    }

    // 5. Position and offset children absolute coordinates
    const totalChildrenHeight =
      finalChildren.reduce((sum, c) => sum + (c?.height ?? 0), 0) + totalSpacing;
    const excessHeight = innerHeight - totalChildrenHeight;
    const justifyContent = node.justifyContent ?? 'start';

    let currentY = y + p.top;
    let extraSpacing = 0;

    if (justifyContent === 'end') {
      currentY += Math.max(0, excessHeight);
    } else if (justifyContent === 'center') {
      currentY += Math.max(0, excessHeight) / 2;
    } else if (justifyContent === 'space-between' && finalChildren.length > 1) {
      extraSpacing = Math.max(0, excessHeight) / (finalChildren.length - 1);
    }

    for (let i = 0; i < finalChildren.length; i++) {
      const comp = finalChildren[i];
      const childNode = node.children[i];
      if (!comp || !childNode) continue;

      let childX = x + p.left;

      if (childNode.width !== 'fill' && alignItems !== 'stretch') {
        if (alignItems === 'end') {
          childX += innerWidth - comp.width;
        } else if (alignItems === 'center') {
          childX += (innerWidth - comp.width) / 2;
        }
      }

      // Offset child (and its descendants recursively) from (0,0) to its absolute coordinate
      offsetLayout(comp, childX, currentY - comp.y);

      currentY += comp.height + spacing + extraSpacing;
    }

    return {
      node,
      x,
      y,
      width: finalWidth,
      height: finalHeight,
      children: finalChildren,
    };
  } else {
    // Row container
    // 1. Identify flex children on main axis (width for Row)
    const childStatuses = node.children.map((child) => {
      const isFlex = child.width === 'fill';
      return { child, isFlex, computed: undefined as ComputedNode | undefined };
    });

    // 2. Measure non-flex children (always computed relative to (0,0) first)
    let totalNonFlexWidth = 0;
    for (const status of childStatuses) {
      if (!status.isFlex) {
        const comp = computeLayout(status.child, innerMaxWidth, innerMaxHeight, 0, 0);
        status.computed = comp;
        totalNonFlexWidth += comp.width;
      }
    }

    // 3. Distribute remaining space among flex children
    const remainingWidth = Math.max(0, innerMaxWidth - totalNonFlexWidth - totalSpacing);
    const totalFlex = childStatuses
      .filter((s) => s.isFlex)
      .reduce((sum, s) => sum + (s.child.flex ?? 1), 0);

    // 4. Second pass: compute layouts with correct constraints (relative to (0,0))
    const finalChildren: ComputedNode[] = [];
    let maxChildHeight = 0;
    let totalWidth = totalSpacing;

    for (const status of childStatuses) {
      let childWidthConstraint = 0;
      let childHeightConstraint = innerMaxHeight;

      if (status.isFlex) {
        const flexVal = status.child.flex ?? 1;
        childWidthConstraint = totalFlex > 0 ? (flexVal / totalFlex) * remainingWidth : 0;
      } else {
        childWidthConstraint = status.computed?.width ?? 0;
      }

      const comp = computeLayout(status.child, childWidthConstraint, childHeightConstraint, 0, 0);
      finalChildren.push(comp);
      maxChildHeight = Math.max(maxChildHeight, comp.height);
      totalWidth += comp.width;
    }

    // Determine final dimensions of row container
    let finalWidth = resolveDimension(
      node.width,
      constraintWidth,
      () => totalWidth + p.left + p.right,
      totalWidth + p.left + p.right,
    );
    let finalHeight = resolveDimension(
      node.height,
      constraintHeight,
      () => maxChildHeight + p.top + p.bottom,
      maxChildHeight + p.top + p.bottom,
    );

    // Clip to parent constraints if auto-sized
    if (node.width === undefined || node.width === 'auto') {
      finalWidth = Math.min(finalWidth, constraintWidth);
    }
    if (node.height === undefined || node.height === 'auto') {
      finalHeight = Math.min(finalHeight, constraintHeight);
    }

    const innerWidth = Math.max(0, finalWidth - p.left - p.right);
    const innerHeight = Math.max(0, finalHeight - p.top - p.bottom);

    // Adjust height for children that are 'fill' height or when alignItems is 'stretch'
    const alignItems = node.alignItems ?? 'start';
    for (let i = 0; i < finalChildren.length; i++) {
      const childNode = node.children[i];
      const comp = finalChildren[i];
      if (childNode && comp) {
        if (childNode.height === 'fill' || alignItems === 'stretch') {
          finalChildren[i] = computeLayout(childNode, comp.width, innerHeight, 0, 0);
        }
      }
    }

    // 5. Position and offset children absolute coordinates
    const totalChildrenWidth =
      finalChildren.reduce((sum, c) => sum + (c?.width ?? 0), 0) + totalSpacing;
    const excessWidth = innerWidth - totalChildrenWidth;
    const justifyContent = node.justifyContent ?? 'start';

    let currentX = x + p.left;
    let extraSpacing = 0;

    if (justifyContent === 'end') {
      currentX += Math.max(0, excessWidth);
    } else if (justifyContent === 'center') {
      currentX += Math.max(0, excessWidth) / 2;
    } else if (justifyContent === 'space-between' && finalChildren.length > 1) {
      extraSpacing = Math.max(0, excessWidth) / (finalChildren.length - 1);
    }

    for (let i = 0; i < finalChildren.length; i++) {
      const comp = finalChildren[i];
      const childNode = node.children[i];
      if (!comp || !childNode) continue;

      let childY = y + p.top;

      if (childNode.height !== 'fill' && alignItems !== 'stretch') {
        if (alignItems === 'end') {
          childY += innerHeight - comp.height;
        } else if (alignItems === 'center') {
          childY += (innerHeight - comp.height) / 2;
        }
      }

      // Offset child (and its descendants recursively) from (0,0) to its absolute coordinate
      offsetLayout(comp, currentX - comp.x, childY - comp.y);

      currentX += comp.width + spacing + extraSpacing;
    }

    return {
      node,
      x,
      y,
      width: finalWidth,
      height: finalHeight,
      children: finalChildren,
    };
  }
}

export function renderLayout(computedNode: ComputedNode): string {
  const result: string[] = [];

  function traverse(computed: ComputedNode) {
    const { node, x, y, width, height } = computed;

    // Render container styling if present
    if (node.type === 'row' || node.type === 'column') {
      if (node.style) {
        result.push(
          rect({
            x,
            y,
            width,
            height,
            rx: node.style.rx,
            ry: node.style.ry,
            fill: node.style.fill ?? 'none',
            stroke: node.style.stroke,
            strokeWidth: node.style.strokeWidth,
            opacity: node.style.opacity,
            className: node.style.className,
          }),
        );
      }

      if (computed.children) {
        for (const child of computed.children) {
          traverse(child);
        }
      }
    } else if (node.type === 'leaf') {
      result.push(node.render(x, y, width, height));
    }
  }

  traverse(computedNode);
  return result.join('\n');
}
