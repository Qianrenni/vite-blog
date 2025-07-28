## Children 类型

### 基本 Children 类型
```typescript
// React.Children 类型
// React.ReactNode - 所有可以作为 children 的类型
type ReactNode = 
  | ReactChild
  | ReactFragment
  | ReactPortal
  | boolean
  | null
  | undefined;

type ReactChild = ReactElement | ReactText;
type ReactText = string | number;
type ReactFragment = {} | ReactNodeArray;
interface ReactNodeArray extends Array<ReactNode> {}

// 基本 Children 使用
interface ContainerProps {
  children: React.ReactNode;
  title?: string;
}

const Container: React.FC<ContainerProps> = ({ children, title }) => {
  return (
    <div className="container">
      {title && <h2>{title}</h2>}
      <div className="container-content">
        {children}
      </div>
    </div>
  );
};

// 使用 Container 组件
const ContainerDemo = () => {
  return (
    <Container title="My Container">
      <p>This is some content.</p>
      <button>Click me</button>
      {true && <span>Conditional content</span>}
      {null}
      {undefined}
      Simple text
      {42}
    </Container>
  );
};
```

### Children 操作和验证
```typescript
// 使用 React.Children API
interface ChildrenProcessorProps {
  children: React.ReactNode;
  separator?: React.ReactNode;
}

const ChildrenProcessor: React.FC<ChildrenProcessorProps> = ({ 
  children, 
  separator = ', ' 
}) => {
  // 过滤掉 null 和 undefined
  const validChildren = React.Children.toArray(children).filter(
    child => child !== null && child !== undefined
  );

  // 在每个子元素之间添加分隔符
  const childrenWithSeparators = validChildren.reduce<React.ReactNode[]>(
    (acc, child, index) => {
      if (index > 0) {
        acc.push(React.cloneElement(separator as React.ReactElement, { key: `sep-${index}` }));
      }
      acc.push(React.cloneElement(child as React.ReactElement, { key: `child-${index}` }));
      return acc;
    },
    []
  );

  return <div>{childrenWithSeparators}</div>;
};

// 使用 ChildrenProcessor
const ChildrenDemo = () => {
  return (
    <ChildrenProcessor separator=" | ">
      <span>First</span>
      <span>Second</span>
      {null}
      <span>Third</span>
      {undefined}
      <span>Fourth</span>
    </ChildrenProcessor>
  );
};

// Children 映射和转换
interface ChildrenMapperProps {
  children: React.ReactNode;
  mapFunction: (child: React.ReactNode, index: number) => React.ReactNode;
}

const ChildrenMapper: React.FC<ChildrenMapperProps> = ({ 
  children, 
  mapFunction 
}) => {
  return (
    <div>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return mapFunction(child, index);
        }
        return child;
      })}
    </div>
  );
};

// 使用 ChildrenMapper
const MapperDemo = () => {
  const addWrapper = (child: React.ReactNode, index: number) => {
    return (
      <div key={index} className="wrapped-item">
        {child}
      </div>
    );
  };

  return (
    <ChildrenMapper mapFunction={addWrapper}>
      <button>Button 1</button>
      <button>Button 2</button>
      <button>Button 3</button>
    </ChildrenMapper>
  );
};
```

### 复杂 Children 类型
```typescript
// 复杂 Children 类型检查
interface LayoutProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  main: React.ReactNode;
  footer?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ header, sidebar, main, footer }) => {
  return (
    <div className="layout">
      {header && <header className="layout-header">{header}</header>}
      <div className="layout-body">
        {sidebar && <aside className="layout-sidebar">{sidebar}</aside>}
        <main className="layout-main">{main}</main>
      </div>
      {footer && <footer className="layout-footer">{footer}</footer>}
    </div>
  );
};

// 使用复杂布局
const ComplexLayoutDemo = () => {
  return (
    <Layout
      header={<h1>Website Header</h1>}
      sidebar={
        <nav>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      }
      main={
        <div>
          <h2>Main Content</h2>
          <p>This is the main content area.</p>
        </div>
      }
      footer={<p>© 2023 My Website</p>}
    />
  );
};

// Children 类型约束
interface StrictChildrenProps {
  children: React.ReactElement | React.ReactElement[];
}

const StrictContainer: React.FC<StrictChildrenProps> = ({ children }) => {
  // 只接受 ReactElement，不接受字符串、数字等
  return (
    <div className="strict-container">
      {React.Children.map(children, (child, index) => 
        React.cloneElement(child, { key: index })
      )}
    </div>
  );
};

// 使用严格 Children
const StrictDemo = () => {
  return (
    <StrictContainer>
      <div>First element</div>
      <div>Second element</div>
      <span>Third element</span>
    </StrictContainer>
  );
};

// 函数作为 Children
interface RenderPropsComponentProps {
  children: (data: { count: number; increment: () => void }) => React.ReactNode;
}

const RenderPropsComponent: React.FC<RenderPropsComponentProps> = ({ children }) => {
  const [count, setCount] = React.useState(0);
  
  const increment = () => setCount(c => c + 1);
  
  return <>{children({ count, increment })}</>;
};

// 使用 Render Props
const RenderPropsDemo = () => {
  return (
    <RenderPropsComponent>
      {({ count, increment }) => (
        <div>
          <p>Count: {count}</p>
          <button onClick={increment}>Increment</button>
        </div>
      )}
    </RenderPropsComponent>
  );
};
```

### Children 工具类型
```typescript
// 自定义 Children 工具类型
type ReactChildElement<T extends React.ElementType = React.ElementType> = 
  React.ReactElement<any, T>;

type ReactChildComponent<P = any> = 
  | ReactChildElement<React.ComponentType<P>>
  | React.FunctionComponentElement<P>;

// Children 类型守卫
interface ChildrenUtils {
  isElement: (child: React.ReactNode) => child is React.ReactElement;
  isDOMElement: (child: React.ReactNode) => child is React.DOMElement<any, Element>;
  isCompositeElement: (child: React.ReactNode) => child is React.ReactElement;
  isText: (child: React.ReactNode) => child is string | number;
}

const ChildrenUtils: ChildrenUtils = {
  isElement: React.isValidElement,
  isDOMElement: (child): child is React.DOMElement<any, Element> => 
    React.isValidElement(child) && typeof child.type === 'string',
  isCompositeElement: (child): child is React.ReactElement => 
    React.isValidElement(child) && typeof child.type !== 'string',
  isText: (child): child is string | number => 
    typeof child === 'string' || typeof child === 'number'
};

// 使用 Children 工具
interface SmartContainerProps {
  children: React.ReactNode;
  className?: string;
}

const SmartContainer: React.FC<SmartContainerProps> = ({ children, className = '' }) => {
  const processedChildren = React.Children.map(children, child => {
    if (ChildrenUtils.isDOMElement(child)) {
      // 为 DOM 元素添加默认类名
      return React.cloneElement(child, {
        className: `${child.props.className || ''} default-style`.trim()
      });
    } else if (ChildrenUtils.isCompositeElement(child)) {
      // 传递额外属性给组件元素
      return React.cloneElement(child, {
        containerClass: className
      });
    } else if (ChildrenUtils.isText(child)) {
      // 包装文本内容
      return <span className="text-wrapper">{child}</span>;
    }
    return child;
  });

  return (
    <div className={`smart-container ${className}`.trim()}>
      {processedChildren}
    </div>
  );
};

// 使用智能容器
const SmartContainerDemo = () => {
  return (
    <SmartContainer className="my-container">
      <div>Regular div</div>
      <p>Regular paragraph</p>
      Plain text content
      {42}
      <CustomComponent>Custom component</CustomComponent>
    </SmartContainer>
  );
};

// 自定义组件用于演示
const CustomComponent: React.FC<{ children: React.ReactNode; containerClass?: string }> = 
({ children, containerClass }) => {
  return (
    <div className={`custom-component ${containerClass || ''}`.trim()}>
      {children}
    </div>
  );
};
```