import { IconSvgElement } from '@hugeicons/react'
import { Home01Icon, UserMultiple02Icon, DashboardSquare03Icon, PackageIcon, Files02Icon } from '@hugeicons/core-free-icons'


type NavItem = {
    name: string
    href: string
    icon: IconSvgElement | undefined
}

type NavItems = {
    name: string
    href: string
    icon: IconSvgElement | undefined
    children?: NavItem[]
}

export const navigation_panel: NavItems[] = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: Home01Icon
    },
    {
        name: 'Contacts',
        href: '/contacts',
        icon: UserMultiple02Icon,
        children: [
            {
                name: 'Customers',
                href: '/contacts/customers',
                icon: UserMultiple02Icon
            },
            {
                name: 'Suppliers',
                href: '/contacts/suppliers',
                icon: UserMultiple02Icon
            },
            {
                name: 'Delivery Agents',
                href: '/contacts/delivery-agents',
                icon: UserMultiple02Icon
            }
        ]
    },
    {
        name: 'Catalogue',
        href: '/catalogue',
        icon: DashboardSquare03Icon,
        // children: [
        //     {
        //         name: 'Presets',
        //         href: '/catalogue/presests',
        //         icon: DashboardSquare03Icon
        //     },
        //     {
        //         name: 'Message Flows',
        //         href: '/catalogue/message-flows',
        //         icon: DashboardSquare03Icon
        //     }
        // ]
    },
    {
        name: 'Orders',
        href: '/orders',
        icon: PackageIcon,
        children: [
            {
                name: 'Order Management',
                href: '/orders/order-management',
                icon: PackageIcon
            },
            {
                name: 'Delivery Calculator',
                href: '/orders/delivery-calculator',
                icon: PackageIcon
            }
        ]
    },
    {
        name: 'Documents',
        href: '/documents',
        icon: Files02Icon,
        children: [
            {
                name: 'Invoices',
                href: '/documents/invoice-management',
                icon: Files02Icon
            },
            {
                name: 'Warranty Cards',
                href: '/documents/warranty-cards',
                icon: Files02Icon
            }
        ]
    },
]