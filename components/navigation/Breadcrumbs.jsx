import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss, mergeRefs } from '../forms/Button.jsx';

const CSS = `
.ef-breadcrumb__list{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:0;padding:0;list-style:none;font-size:var(--text-sm);color:var(--text-muted);overflow-wrap:anywhere}
.ef-breadcrumb__item{display:inline-flex;align-items:center;gap:6px}
.ef-breadcrumb__link{color:var(--text-muted);text-decoration:none;padding:2px 4px;border-radius:var(--radius-sm);transition:color var(--dur-fast) var(--ease-out)}
.ef-breadcrumb__link:hover{color:var(--text-primary);text-decoration:none}
.ef-breadcrumb__link:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-breadcrumb__page{color:var(--text-primary);font-weight:var(--weight-regular)}
.ef-breadcrumb__separator{display:inline-flex;color:var(--sand-400)}
[dir="rtl"] .ef-breadcrumb__separator{transform:rotate(180deg)}
.ef-breadcrumb__ellipsis{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;color:var(--text-muted)}
.ef-breadcrumb__sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
`;

export const Breadcrumb = React.forwardRef(function Breadcrumb({ className, ...rest }, ref) {
  injectEfCss('ef-css-breadcrumb', CSS);
  return <nav aria-label="breadcrumb" {...rest} ref={ref} data-slot="breadcrumb" className={`ef-breadcrumb${className ? ' ' + className : ''}`} />;
});

export const BreadcrumbList = React.forwardRef(function BreadcrumbList({ className, ...rest }, ref) {
  return <ol {...rest} ref={ref} data-slot="breadcrumb-list" className={`ef-breadcrumb__list${className ? ' ' + className : ''}`} />;
});

export const BreadcrumbItem = React.forwardRef(function BreadcrumbItem({ className, ...rest }, ref) {
  return <li {...rest} ref={ref} data-slot="breadcrumb-item" className={`ef-breadcrumb__item${className ? ' ' + className : ''}`} />;
});

export const BreadcrumbLink = React.forwardRef(function BreadcrumbLink({ asChild = false, children, className, ...rest }, ref) {
  const classes = `ef-breadcrumb__link${className ? ' ' + className : ''}`;
  if (asChild) {
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      ...rest,
      ...child.props,
      ref: mergeRefs(ref, child.ref),
      'data-slot': 'breadcrumb-link',
      className: `${classes}${child.props.className ? ' ' + child.props.className : ''}`,
    });
  }
  return <a {...rest} ref={ref} data-slot="breadcrumb-link" className={classes}>{children}</a>;
});

export const BreadcrumbPage = React.forwardRef(function BreadcrumbPage({ className, ...rest }, ref) {
  return <span {...rest} ref={ref} data-slot="breadcrumb-page" role="link" aria-disabled="true" aria-current="page" className={`ef-breadcrumb__page${className ? ' ' + className : ''}`} />;
});

export const BreadcrumbSeparator = React.forwardRef(function BreadcrumbSeparator({ children, className, ...rest }, ref) {
  return (
    <li {...rest} ref={ref} data-slot="breadcrumb-separator" role="presentation" aria-hidden="true" className={`ef-breadcrumb__separator${className ? ' ' + className : ''}`}>
      {children ?? <Icon name="chevron-right" size={14} />}
    </li>
  );
});

export const BreadcrumbEllipsis = React.forwardRef(function BreadcrumbEllipsis({ className, ...rest }, ref) {
  return (
    <span {...rest} ref={ref} data-slot="breadcrumb-ellipsis" role="presentation" aria-hidden="true" className={`ef-breadcrumb__ellipsis${className ? ' ' + className : ''}`}>
      <Icon name="ellipsis" size={16} />
      <span className="ef-breadcrumb__sr">More</span>
    </span>
  );
});

export const Breadcrumbs = React.forwardRef(function Breadcrumbs({ items = [], className, ...rest }, ref) {
  return (
    <Breadcrumb {...rest} ref={ref} className={className}>
      <BreadcrumbList>
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <React.Fragment key={item.id || index}>
              <BreadcrumbItem>
                {last
                  ? <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  : <BreadcrumbLink href={item.href || '#'} onClick={item.onClick}>{item.label}</BreadcrumbLink>}
              </BreadcrumbItem>
              {!last ? <BreadcrumbSeparator /> : null}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
});
