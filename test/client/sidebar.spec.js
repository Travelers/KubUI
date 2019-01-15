
import Vue from 'vue'
import Sidebar from '../../public/components/Sidebar.vue'
import { expect } from 'chai'

describe('Sidebar', () => {
    let vm

    beforeEach(() => {
        const Constructor = Vue.extend(Sidebar)
        vm = new Constructor().$mount()    
    })

    describe('data', () => {
        it('exposes a data function', () => {
            expect(typeof Sidebar.data).to.eq('function')
        })

        it('defaults navItems to empty array', () => {
            expect(Sidebar.data().navItems).to.be.an('array').that.is.not.empty
        })
    })

    describe('toggle', () => {
        it('sets active to false when is active', () => {
            expect(vm.navItems[0].active).is.true
            vm.toggleActive(0)
            expect(vm.navItems[0].active).is.false
        })
    })
})