// Pseudo-code for safer context
const { data: balance } = useQuery({ queryKey: ['balance'], queryFn: fetchBalance });
// mutate calls Edge Function directly
