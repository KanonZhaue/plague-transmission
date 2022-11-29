var ini = {
    radar_args_changed: {},
    scene: '',
    ticks: 11,
    currentTick: 0,
    currentDay: 0,
    // tickClock: [0, 6, 8, 11, 12, 13, 15, 17, 18, 19, 21, 24], // tickClock[currentTick]/24
    tickClock: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // tickClock[currentTick]/24
    days: 31,
    SEIR_data: {},
    iniChanged: 0,
    showSocialNetwork: 0,
    collision: 0,
    stateUpdated: 0,
    river_range: 10,          // river 领域
    isolation_tick: 0,        // update code is in Map.script.js
    // isolation_tick: null,        // update code is in Map.script.js
    incubation: 5,            // 潜伏期
    rehabilitation: 1,        // 康复延迟（天）
    N: 200,                  // 角色数量
    temp_N: 2000,
    // I_beta_x1:0.5,        // x1 社交距离的接触的传染概率-感染者
    // I_beta_x2:0.2,        // x2 社交距离的传染概率-感染者
    // E_beta_x1:0.4,        // x1 社交距离的接触的传染概率-潜伏者
    // E_beta_x2:0.1,        // x2 社交距离的传染概率-潜伏着
    r: 8,                     // 平均接触人数
    beta: 0.85,              // 传染概率β 0.555
    rho: 1,                   // 有效接触系数ρ
    delta: 0,                 // 感染者转换为隔离者的概率
    lambda: 1,                // λ是隔离解除速率
    theta: 0.6,               // θ是潜伏者（E）相对于感染者传播能力的比值
    med: 0.4,
    sigma: 0.06,            // σ为潜伏者（E）向感染者（I）的转化速率
    dist: 4.0,
    d: 1.5, //1.5                  // 感染者的影响距离(社交距离)
    I_gamma: 0.013,            // I的恢复系数γ
    ISO_gamma: 0,             // 隔离者的恢复率
    // I_r:10,               // 感染者平均每天接触的人数
    // E_r:20,               // 潜伏着平均接触人数
    q: 0,                     // 隔离比例
    Te: 14,                   // 潜伏期
    S: 0,                     // 易感人群数量
    E: 0,                     // 潜伏者数
    I: 1,                     // 感染者数
    R: 0,                     // 治愈者数
    ISO: 0,                   // 隔离者人数
    // alpha:0.1,            // 潜伏着转换成感染者的概率
    close_distance: 2,   // 密切接触者的判断距离
    lifelong_immunity: true,  // 是否终身免疫
    start_isolation: false,
    start_action: null,
    /***************************************************************/
    distanceLine: false,
    trace_id: null,
    river_show: ['susceptible'],
    river_content: 'normal',
    storyline_pattern: "transmission",
    force_role: 0,
    n_trace_pages: 0,
    trace_page: 1,
    args: {},
    seleted_scene: 'default',
    changeConfig: 0,
    tips_content: null,
    tips_display: false,
    trace_days: 15,
    recoveryNetwork: 0,
    tree_max_depth: 0,
    tree_depth_filter: null,
    scenes: [],
    newScene: "",
    addScene: 0,
    delScene:0,
    DelSceneIndex:0,
    Start: 0,
    SceneType :['Rest Area','Administrative Area','Working Area','Catering Area','Entertainment Area'],
    SceneTypeNum:[1,1,1,1,1],//SceneType表示五个类型的场景，SceneTypeNum就是对应类型场景的个数

}

ini.S = ini.N - ini.E - ini.I - ini.R - ini.ISO
ini.temp_N = ini.N


export default ini