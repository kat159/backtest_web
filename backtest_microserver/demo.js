const func = async () => {
    setTimeout(()=>{}, 1000);
    return 1
}

const func2 = async () => {
    const a = await func()
    console.log(a)
}

func2()

console.log(1111, [].map(v => v));