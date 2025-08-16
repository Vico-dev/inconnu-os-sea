// SWC plugin to stub out react-email templates at build time
module.exports = function () {
  return {
    name: 'null-email-plugin',
    visitor: {
      Program(path) {
        const file = path.hub?.file?.opts?.filename || ''
        if (file.includes('/components/emails/')) {
          path.replaceWithSourceString(
            'export default function EmailStub(){return null}'
          )
        }
      },
    },
  }
}

