import { Badge } from '@/components/ui/badge'

interface Balance {
    id: string
    balance: number
    monthly_increment?: number
    leave_types: {
        id: string
        name: string
        code: string
        color: string
    }
}

interface EmployeeBalancesCellProps {
    balances: Balance[]
}

export function EmployeeBalancesCell({ balances }: EmployeeBalancesCellProps) {
    if (!balances || balances.length === 0) {
        return <span className="text-muted-foreground text-xs">-</span>
    }

    return (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
            {balances.slice(0, 3).map((balance) => (
                <Badge
                    key={balance.id}
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-5 font-medium"
                    style={{
                        borderColor: balance.leave_types?.color,
                        color: balance.leave_types?.color,
                    }}
                    title={`${balance.leave_types?.name}: ${balance.balance} jours`}
                >
                    {balance.leave_types?.code}: {balance.balance}
                </Badge>
            ))}
            {balances.length > 3 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                    +{balances.length - 3}
                </Badge>
            )}
        </div>
    )
}
