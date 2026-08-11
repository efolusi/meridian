# Navigation Menu

A composable site-navigation menu for product areas, resources, and direct links. It supports a shared animated viewport, trigger indicator, controlled state, delayed hover opening, roving keyboard focus, RTL-aware arrows, and `asChild` links.

```jsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem value="platform">
      <NavigationMenuTrigger>Platform</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="/automation">Automation</NavigationMenuLink>
        <NavigationMenuLink href="/observability">Observability</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink href="/pricing">Pricing</NavigationMenuLink>
    </NavigationMenuItem>
    <NavigationMenuIndicator />
  </NavigationMenuList>
</NavigationMenu>
```

Set `viewport={false}` for content positioned directly below each trigger. Use Menubar for application commands; use Navigation Menu for destinations and product discovery.
