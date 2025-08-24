import{j as e}from"./jsx-runtime-B2X-ZC1P.js";import"./iframe-BfY0ZA6s.js";import"./preload-helper-C1FmrZbK.js";const a=({variant:g="primary",size:J="medium",loading:r=!1,disabled:K,children:Q,className:X="",...Y})=>{const Z="repo-button",ee=`repo-button--${g}`,ae=`repo-button--${J}`,re=[Z,ee,ae,r?"repo-button--loading":"",X].filter(Boolean).join(" ");return e.jsxs("button",{className:re,disabled:K||r,...Y,children:[r&&e.jsx("span",{className:"repo-button__spinner"}),e.jsx("span",{className:r?"repo-button__content--loading":"repo-button__content",children:Q})]})};try{a.displayName="Button",a.__docgenInfo={description:"",displayName:"Button",props:{variant:{defaultValue:{value:"primary"},description:"",name:"variant",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"primary"'},{value:'"secondary"'},{value:'"danger"'},{value:'"ghost"'}]}},size:{defaultValue:{value:"medium"},description:"",name:"size",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"small"'},{value:'"medium"'},{value:'"large"'}]}},loading:{defaultValue:{value:"false"},description:"",name:"loading",required:!1,type:{name:"boolean | undefined"}}}}}catch{}const ie={title:"UI/Button",component:a,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:{type:"select"},options:["primary","secondary","danger","ghost"]},size:{control:{type:"select"},options:["small","medium","large"]},loading:{control:{type:"boolean"}},disabled:{control:{type:"boolean"}}},args:{onClick:()=>console.log("Button clicked")}},n={args:{variant:"primary",children:"Button"}},s={args:{variant:"secondary",children:"Button"}},t={args:{variant:"danger",children:"Delete"}},o={args:{variant:"ghost",children:"Cancel"}},i={args:{size:"small",children:"Small Button"}},l={args:{size:"large",children:"Large Button"}},d={args:{loading:!0,children:"Loading..."}},c={args:{disabled:!0,children:"Disabled Button"}},u={render:()=>e.jsxs("div",{style:{display:"flex",gap:"1rem",flexWrap:"wrap",alignItems:"center"},children:[e.jsx(a,{variant:"primary",children:"Primary"}),e.jsx(a,{variant:"secondary",children:"Secondary"}),e.jsx(a,{variant:"danger",children:"Danger"}),e.jsx(a,{variant:"ghost",children:"Ghost"})]})},m={render:()=>e.jsxs("div",{style:{display:"flex",gap:"1rem",alignItems:"center"},children:[e.jsx(a,{size:"small",children:"Small"}),e.jsx(a,{size:"medium",children:"Medium"}),e.jsx(a,{size:"large",children:"Large"})]})},p={render:()=>e.jsxs("div",{style:{display:"flex",gap:"1rem",flexWrap:"wrap",alignItems:"center"},children:[e.jsx(a,{loading:!0,children:"Loading Primary"}),e.jsx(a,{variant:"secondary",loading:!0,children:"Loading Secondary"}),e.jsx(a,{variant:"danger",loading:!0,children:"Loading Danger"})]})};var y,v,h;n.parameters={...n.parameters,docs:{...(y=n.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    variant: "primary",
    children: "Button"
  }
}`,...(h=(v=n.parameters)==null?void 0:v.docs)==null?void 0:h.source}}};var B,x,S;s.parameters={...s.parameters,docs:{...(B=s.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    variant: "secondary",
    children: "Button"
  }
}`,...(S=(x=s.parameters)==null?void 0:x.docs)==null?void 0:S.source}}};var f,b,j;t.parameters={...t.parameters,docs:{...(f=t.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    variant: "danger",
    children: "Delete"
  }
}`,...(j=(b=t.parameters)==null?void 0:b.docs)==null?void 0:j.source}}};var L,z,_;o.parameters={...o.parameters,docs:{...(L=o.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    variant: "ghost",
    children: "Cancel"
  }
}`,...(_=(z=o.parameters)==null?void 0:z.docs)==null?void 0:_.source}}};var D,C,I;i.parameters={...i.parameters,docs:{...(D=i.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    size: "small",
    children: "Small Button"
  }
}`,...(I=(C=i.parameters)==null?void 0:C.docs)==null?void 0:I.source}}};var P,N,V;l.parameters={...l.parameters,docs:{...(P=l.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    size: "large",
    children: "Large Button"
  }
}`,...(V=(N=l.parameters)==null?void 0:N.docs)==null?void 0:V.source}}};var w,A,G;d.parameters={...d.parameters,docs:{...(w=d.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    loading: true,
    children: "Loading..."
  }
}`,...(G=(A=d.parameters)==null?void 0:A.docs)==null?void 0:G.source}}};var W,q,k;c.parameters={...c.parameters,docs:{...(W=c.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    disabled: true,
    children: "Disabled Button"
  }
}`,...(k=(q=c.parameters)==null?void 0:q.docs)==null?void 0:k.source}}};var E,M,$;u.parameters={...u.parameters,docs:{...(E=u.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    alignItems: "center"
  }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
}`,...($=(M=u.parameters)==null?void 0:M.docs)==null?void 0:$.source}}};var O,R,T;m.parameters={...m.parameters,docs:{...(O=m.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: "1rem",
    alignItems: "center"
  }}>
      <Button size="small">Small</Button>
      <Button size="medium">Medium</Button>
      <Button size="large">Large</Button>
    </div>
}`,...(T=(R=m.parameters)==null?void 0:R.docs)==null?void 0:T.source}}};var U,F,H;p.parameters={...p.parameters,docs:{...(U=p.parameters)==null?void 0:U.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    alignItems: "center"
  }}>
      <Button loading>Loading Primary</Button>
      <Button variant="secondary" loading>
        Loading Secondary
      </Button>
      <Button variant="danger" loading>
        Loading Danger
      </Button>
    </div>
}`,...(H=(F=p.parameters)==null?void 0:F.docs)==null?void 0:H.source}}};const le=["Primary","Secondary","Danger","Ghost","Small","Large","Loading","Disabled","AllVariants","AllSizes","LoadingStates"];export{m as AllSizes,u as AllVariants,t as Danger,c as Disabled,o as Ghost,l as Large,d as Loading,p as LoadingStates,n as Primary,s as Secondary,i as Small,le as __namedExportsOrder,ie as default};
