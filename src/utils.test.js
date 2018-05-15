import { getFullUrlPath } from './utils'

const urlParser = url => {
  const a = document.createElement('a')
  a.href = url
  return a
}

describe('vue-authenticate/utils', () => {
  describe('#getFullUrlPath', () => {
    describe('with no port in URL', () => {
      it('should add port 80 for http URL', () => {
        expect(getFullUrlPath(urlParser('http://example.com/auth'))).toBe('http://example.com:80/auth')
      })
      it('should add port 443 for https URL', () => {
        expect(getFullUrlPath(urlParser('https://example.com/auth'))).toBe('https://example.com:443/auth')
      })
    })
    describe('with port in URL', () => {
      it('should respect port other than "0" for http URL', () => {
        expect(getFullUrlPath(urlParser('http://example.com:2999/auth'))).toBe('http://example.com:2999/auth')
      })
      it('should respect port other than "0" for https URL', () => {
        expect(getFullUrlPath(urlParser('https://example.com:1/auth'))).toBe('https://example.com:1/auth')
      })
      it('should convert port "0" to "80" for http URL', () => {
        expect(getFullUrlPath(urlParser('http://example.com:0/auth'))).toBe('http://example.com:80/auth')
      })
      it('should convert port "0" to "443" for https URL', () => {
        expect(getFullUrlPath(urlParser('https://example.com:0/auth'))).toBe('https://example.com:443/auth')
      })
    })
  })
})
