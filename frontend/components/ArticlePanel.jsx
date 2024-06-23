import revertIcon from "/frontend/images/revert_icon.png"
import rejectIcon from "/frontend/images/reject_remaining_icon.png"
import acceptIcon from "/frontend/images/accept_remaining_icon.png"
import exitIcon from "/frontend/images/x_empty.png"
import nextIcon from "/frontend/images/next_icon.png"

export default function ArticlePanel() {
    return (
    <div className="workshop-panel">
        <div className="exit-buttons">
            <span className="icon-wrapper"><img id="revert-changes-icon" className="render-icon" src={revertIcon} />
                <div className="tool-tip">Revert to original edits</div>
            </span>
            <span id="reject-remaining-wrapper" className="icon-wrapper"><img id="reject-remaining-icon" className="render-icon" src={rejectIcon} />
                <div className="tool-tip">Reject remaining changes</div>
            </span>
            <span id="accept-remaining-wrapper" className="icon-wrapper"><img id="accept-remaining-icon" className="render-icon" src={acceptIcon} />
                <div className="tool-tip">Accept remaining changes</div>
            </span>
            <span id="exit-wrapper" className="icon-wrapper"><img id="exit-icon" className="render-icon" src={exitIcon} />
                <div className="tool-tip">Save changes and exit</div>
            </span>
        </div>
        <div>
            <div className="workshop-accept-buttons">
                <button id="reject-button" className="btn btn-danger">Reject Selected Change ⛔</button>
                <button id="accept-button" className="btn btn-success">Accept Selected Change ✓</button>
            </div>
            <div className="jump-buttons">
                <button>Next change <img className="render-icon" src={nextIcon} /></button>
            </div>
        </div>
    </div>
    )
}