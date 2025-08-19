import React from 'react'

export const Html = ({ children, ...props }: any) => React.createElement('html', props, children)
export const Head = ({ children, ...props }: any) => React.createElement(React.Fragment, props, children)
export const Main = () => null
export const NextScript = () => null

export default function Document() {
  return null
}

