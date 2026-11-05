import type * as React from 'react';
type IconName = 'arrow-up-right' | 'arrow-down-left' | 'arrow-up' | 'arrow-down' | 'arrow-right' | 'chevron-down' | 'chevron-right' | 'chevron-left' | 'x' | 'check' | 'plus' | 'minus' | 'search' | 'eye' | 'eye-off' | 'bell' | 'user' | 'settings' | 'logout' | 'home' | 'chart-line' | 'wallet' | 'arrows-exchange' | 'building-bank' | 'clock' | 'copy' | 'info-circle' | 'alert-triangle' | 'alert-circle' | 'circle-check' | 'shield-check' | 'id' | 'file-upload' | 'camera' | 'refresh';
type Tone = 'neutral' | 'flash' | 'up' | 'down' | 'warning' | 'info' | 'dark';
type Asset = 'BTC' | 'ETH' | 'BNB' | 'DOGE' | 'USDT' | 'SOL';
export interface LogoProps { variant?: 'horizontal' | 'symbol'; size?: number; tone?: 'auto' | 'light' | 'dark'; className?: string }
export interface IconProps { name: IconName; size?: number; stroke?: number; label?: string; className?: string }
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'dark' | 'secondary' | 'ghost' | 'buy' | 'sell'; size?: 'sm' | 'md' | 'lg'; block?: boolean; loading?: boolean; iconLeft?: IconName; iconRight?: IconName }
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { icon: IconName; label: string; variant?: 'ghost' | 'secondary' | 'primary'; size?: 'sm' | 'md'; badge?: boolean }
export interface BadgeProps { tone?: Tone; icon?: IconName; children?: React.ReactNode }
export interface StatusBadgeProps { status: 'completed' | 'pending' | 'processing' | 'failed'; children?: React.ReactNode }
export interface PriceChangeProps { value: number; digits?: number; variant?: 'plain' | 'soft' }
export interface CryptoIconProps { symbol: Asset | string; size?: number; src?: string }
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> { label?: string; hint?: string; error?: string; icon?: IconName; prefix?: React.ReactNode; suffix?: React.ReactNode }
export interface AmountInputProps { label?: string; value?: string | number; defaultValue?: string | number; onChange?: (value: string) => void; min?: number; max?: number; quick?: number[]; hint?: string }
export interface CryptoSelectProps { items: { symbol: Asset | string; name: string; change?: number }[]; value?: string; defaultValue?: string; onChange?: (symbol: string) => void; label?: string }
export interface SwitchProps { label: string; description?: string; checked?: boolean; defaultChecked?: boolean; onChange?: (checked: boolean) => void; disabled?: boolean }
export interface OtpInputProps { length?: number; onComplete?: (code: string) => void; error?: boolean; label?: string }
export interface TabsProps { items: (string | { value: string; label: React.ReactNode })[]; value?: string; defaultValue?: string; onChange?: (value: string) => void; variant?: 'segmented' | 'underline'; block?: boolean; label?: string }
export interface BalanceCardProps { amount: number; gain?: number; gainLabel?: string; label?: string; children?: React.ReactNode }
export interface AssetRowProps { symbol: Asset | string; name?: string; holding?: number; value?: number; price?: number; change?: number; trend?: number[]; onClick?: () => void }
export interface Transaction { date?: string; type: 'deposit' | 'withdraw' | 'invest' | 'gain'; title?: string; subtitle?: string; time?: string; amount: number; status?: 'completed' | 'pending' | 'processing' | 'failed' }
export interface TransactionListProps { items: Transaction[]; emptyText?: string }
export interface SparklineProps { data: number[]; width?: number; height?: number }
export interface PriceChartProps { series: Record<string, number[]>; ranges?: string[]; defaultRange?: string; height?: number; label?: string }
export interface AllocationDonutProps { items: { symbol?: Asset | string; label?: string; value: number; color?: string }[]; centerLabel?: string; size?: number }
export interface AlertProps { tone?: 'info' | 'up' | 'warning' | 'down' | 'flash'; title?: string; children?: React.ReactNode; action?: React.ReactNode }
export interface ToastProps { tone?: 'up' | 'info' | 'warning' | 'down'; title: string; description?: string; onClose?: () => void }
export interface ModalProps { open: boolean; onClose?: () => void; title: string; children?: React.ReactNode; footer?: React.ReactNode }
export interface StepperProps { steps: string[]; current: number; label?: string }
export interface TopBarProps { title?: string; onBack?: () => void; right?: React.ReactNode }
export interface BottomNavProps { items?: { value: string; label: string; icon: IconName; primary?: boolean }[]; value?: string; defaultValue?: string; onChange?: (value: string) => void }
export interface SkeletonProps { width?: number | string; height?: number | string; circle?: boolean }
export interface HeroBlockProps { eyebrow?: string; lead: string; cta?: string; secondary?: string; title: React.ReactNode; media?: React.ReactNode }
export declare function Logo(props: LogoProps): React.ReactElement;
export declare function Icon(props: IconProps): React.ReactElement;
export declare function Button(props: ButtonProps): React.ReactElement;
export declare function IconButton(props: IconButtonProps): React.ReactElement;
export declare function Badge(props: BadgeProps): React.ReactElement;
export declare function StatusBadge(props: StatusBadgeProps): React.ReactElement;
export declare function PriceChange(props: PriceChangeProps): React.ReactElement;
export declare function CryptoIcon(props: CryptoIconProps): React.ReactElement;
export declare function Input(props: InputProps): React.ReactElement;
export declare function AmountInput(props: AmountInputProps): React.ReactElement;
export declare function CryptoSelect(props: CryptoSelectProps): React.ReactElement;
export declare function Switch(props: SwitchProps): React.ReactElement;
export declare function OtpInput(props: OtpInputProps): React.ReactElement;
export declare function Tabs(props: TabsProps): React.ReactElement;
export declare function BalanceCard(props: BalanceCardProps): React.ReactElement;
export declare function AssetRow(props: AssetRowProps): React.ReactElement;
export declare function TransactionList(props: TransactionListProps): React.ReactElement;
export declare function Sparkline(props: SparklineProps): React.ReactElement;
export declare function PriceChart(props: PriceChartProps): React.ReactElement;
export declare function AllocationDonut(props: AllocationDonutProps): React.ReactElement;
export declare function Alert(props: AlertProps): React.ReactElement;
export declare function Toast(props: ToastProps): React.ReactElement;
export declare function Modal(props: ModalProps): React.ReactElement;
export declare function Stepper(props: StepperProps): React.ReactElement;
export declare function TopBar(props: TopBarProps): React.ReactElement;
export declare function BottomNav(props: BottomNavProps): React.ReactElement;
export declare function Skeleton(props: SkeletonProps): React.ReactElement;
export declare function HeroBlock(props: HeroBlockProps): React.ReactElement;
export declare function formatUSD(value: number): string;
export declare function formatPct(value: number, digits?: number): string;
export declare function formatCrypto(value: number, symbol: string): string;
declare global { interface Window { FlashInv: { Logo: typeof Logo; Icon: typeof Icon; Button: typeof Button; IconButton: typeof IconButton; Badge: typeof Badge; StatusBadge: typeof StatusBadge; PriceChange: typeof PriceChange; CryptoIcon: typeof CryptoIcon; Input: typeof Input; AmountInput: typeof AmountInput; CryptoSelect: typeof CryptoSelect; Switch: typeof Switch; OtpInput: typeof OtpInput; Tabs: typeof Tabs; BalanceCard: typeof BalanceCard; AssetRow: typeof AssetRow; TransactionList: typeof TransactionList; Sparkline: typeof Sparkline; PriceChart: typeof PriceChart; AllocationDonut: typeof AllocationDonut; Alert: typeof Alert; Toast: typeof Toast; Modal: typeof Modal; Stepper: typeof Stepper; TopBar: typeof TopBar; BottomNav: typeof BottomNav; Skeleton: typeof Skeleton; HeroBlock: typeof HeroBlock; formatUSD: typeof formatUSD; formatPct: typeof formatPct; formatCrypto: typeof formatCrypto } } }
